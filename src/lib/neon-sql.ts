import { Pool, type QueryResultRow } from "pg";

const globalForPg = globalThis as unknown as {
  neonPool?: Pool;
};

function getConnectionString() {
  return process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || "";
}

function createPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
}

export function getNeonPool() {
  if (!globalForPg.neonPool) {
    globalForPg.neonPool = createPool();
  }
  return globalForPg.neonPool;
}

export async function queryNeon<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getNeonPool().query<T>(text, values);
}

function mapUser(row: Record<string, unknown> | undefined | null) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: typeof row.name === "string" ? row.name : null,
    email: String(row.email),
    password: typeof row.password === "string" ? row.password : null,
    role: String(row.role),
    isActive: Boolean(row.isActive),
    onboardingCompleted: Boolean(row.onboardingCompleted),
    emailVerifiedAt: row.emailVerifiedAt ? String(row.emailVerifiedAt) : null,
  };
}

function mapPendingSignup(row: Record<string, unknown> | undefined | null) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    password: String(row.password),
    token: String(row.token),
    expiresAt: String(row.expiresAt),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function findUserByEmailNeon(email: string) {
  const result = await queryNeon(
    `
      select
        id,
        name,
        email,
        password,
        role,
        "isActive",
        "onboardingCompleted",
        "emailVerifiedAt"
      from users
      where email = $1
      limit 1
    `,
    [email.toLowerCase().trim()],
  );

  return mapUser(result.rows[0] as Record<string, unknown> | undefined);
}

export async function createUserNeon(input: {
  name: string;
  email: string;
  hashedPassword: string;
  emailVerifiedAt?: Date | null;
}) {
  const result = await queryNeon(
    `
      insert into users (
        id,
        name,
        email,
        password,
        "emailVerifiedAt",
        role,
        "isActive",
        "onboardingCompleted",
        "createdAt",
        "updatedAt"
      )
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, 'STUDENT', true, false, now(), now())
      returning
        id,
        name,
        email,
        role,
        "isActive",
        "onboardingCompleted",
        "emailVerifiedAt"
    `,
    [input.name, input.email.toLowerCase().trim(), input.hashedPassword, input.emailVerifiedAt ?? null],
  );

  return mapUser(result.rows[0] as Record<string, unknown> | undefined);
}

export async function findPendingSignupByEmailNeon(email: string) {
  const result = await queryNeon(
    `
      select
        id,
        name,
        email,
        password,
        token,
        "expiresAt",
        "createdAt",
        "updatedAt"
      from pending_signups
      where email = $1
      limit 1
    `,
    [email.toLowerCase().trim()],
  );

  return mapPendingSignup(result.rows[0] as Record<string, unknown> | undefined);
}

export async function findPendingSignupByTokenNeon(token: string) {
  const result = await queryNeon(
    `
      select
        id,
        name,
        email,
        password,
        token,
        "expiresAt",
        "createdAt",
        "updatedAt"
      from pending_signups
      where token = $1
      limit 1
    `,
    [token.trim()],
  );

  return mapPendingSignup(result.rows[0] as Record<string, unknown> | undefined);
}

export async function upsertPendingSignupNeon(input: {
  name: string;
  email: string;
  hashedPassword: string;
  token: string;
  expiresAt: Date;
}) {
  const result = await queryNeon(
    `
      insert into pending_signups (
        id,
        name,
        email,
        password,
        token,
        "expiresAt",
        "createdAt",
        "updatedAt"
      )
      values (concat('pending_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5, now(), now())
      on conflict (email)
      do update set
        name = excluded.name,
        password = excluded.password,
        token = excluded.token,
        "expiresAt" = excluded."expiresAt",
        "updatedAt" = now()
      returning
        id,
        name,
        email,
        password,
        token,
        "expiresAt",
        "createdAt",
        "updatedAt"
    `,
    [input.name, input.email.toLowerCase().trim(), input.hashedPassword, input.token, input.expiresAt],
  );

  return mapPendingSignup(result.rows[0] as Record<string, unknown> | undefined);
}

export async function deletePendingSignupByEmailNeon(email: string) {
  await queryNeon(`delete from pending_signups where email = $1`, [email.toLowerCase().trim()]);
}

export async function consumePendingSignupTokenNeon(token: string) {
  const pool = getNeonPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const pendingResult = await client.query(
      `
        select
          id,
          name,
          email,
          password,
          token,
          "expiresAt",
          "createdAt",
          "updatedAt"
        from pending_signups
        where token = $1
        for update
      `,
      [token.trim()],
    );

    const pending = mapPendingSignup(pendingResult.rows[0] as Record<string, unknown> | undefined);
    if (!pending) {
      await client.query("rollback");
      return null;
    }

    if (new Date(pending.expiresAt).getTime() < Date.now()) {
      await client.query(`delete from pending_signups where id = $1`, [pending.id]);
      await client.query("commit");
      return { expired: true as const, pending };
    }

    const existingUserResult = await client.query(
      `
        select
          id,
          name,
          email,
          password,
          role,
          "isActive",
          "onboardingCompleted",
          "emailVerifiedAt"
        from users
        where email = $1
        limit 1
      `,
      [pending.email],
    );

    const existingUser = mapUser(existingUserResult.rows[0] as Record<string, unknown> | undefined);
    if (existingUser) {
      await client.query(`delete from pending_signups where id = $1`, [pending.id]);
      await client.query("commit");
      return { expired: false as const, pending, user: existingUser, alreadyExists: true as const };
    }

    const createdUserResult = await client.query(
      `
        insert into users (
          id,
          name,
          email,
          password,
          "emailVerifiedAt",
          role,
          "isActive",
          "onboardingCompleted",
          "createdAt",
          "updatedAt"
        )
        values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, now(), 'STUDENT', true, false, now(), now())
        returning
          id,
          name,
          email,
          password,
          role,
          "isActive",
          "onboardingCompleted",
          "emailVerifiedAt"
      `,
      [pending.name, pending.email, pending.password],
    );

    await client.query(`delete from pending_signups where id = $1`, [pending.id]);
    await client.query("commit");
    return {
      expired: false as const,
      pending,
      user: mapUser(createdUserResult.rows[0] as Record<string, unknown> | undefined),
      alreadyExists: false as const,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function upsertOAuthUserNeon(input: {
  email: string;
  name?: string | null;
}) {
  const result = await queryNeon(
    `
      insert into users (
        id,
        email,
        name,
        role,
        "isActive",
        "onboardingCompleted",
        "emailVerifiedAt",
        "createdAt",
        "updatedAt"
      )
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, 'STUDENT', true, false, now(), now(), now())
      on conflict (email)
      do update set
        name = coalesce(excluded.name, users.name),
        "emailVerifiedAt" = now(),
        "updatedAt" = now()
      returning
        id,
        name,
        email,
        role,
        "isActive",
        "onboardingCompleted",
        "emailVerifiedAt"
    `,
    [input.email.toLowerCase().trim(), input.name ?? null],
  );

  return mapUser(result.rows[0] as Record<string, unknown> | undefined);
}

export async function replaceEmailVerificationTokenNeon(input: {
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  await queryNeon(`delete from email_verification_tokens where "userId" = $1`, [input.userId]);
  await queryNeon(
    `
      insert into email_verification_tokens (id, token, "userId", "expiresAt", "createdAt")
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, now())
    `,
    [input.token, input.userId, input.expiresAt],
  );
}

export async function findVerificationTokenNeon(token: string) {
  const result = await queryNeon(
    `
      select
        evt.token,
        evt."expiresAt",
        u.id as "userId",
        u.name,
        u.email,
        u."isActive",
        u."emailVerifiedAt"
      from email_verification_tokens evt
      join users u on u.id = evt."userId"
      where evt.token = $1
      limit 1
    `,
    [token],
  );

  const row = result.rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  return {
    expiresAt: row.expiresAt ? String(row.expiresAt) : null,
    user: {
      id: String(row.userId),
      name: typeof row.name === "string" ? row.name : null,
      email: String(row.email),
      isActive: Boolean(row.isActive),
      emailVerifiedAt: row.emailVerifiedAt ? String(row.emailVerifiedAt) : null,
    },
  };
}

export async function markEmailVerifiedNeon(userId: string) {
  await queryNeon(`update users set "emailVerifiedAt" = now(), "updatedAt" = now() where id = $1`, [userId]);
  await queryNeon(`delete from email_verification_tokens where "userId" = $1`, [userId]);
}

export async function deleteVerificationTokensForUserNeon(userId: string) {
  await queryNeon(`delete from email_verification_tokens where "userId" = $1`, [userId]);
}

export async function getCreatorProfileNeon(userId: string) {
  const result = await queryNeon(
    `
      select
        id,
        name,
        email,
        username,
        bio,
        "avatarUrl",
        "coverUrl",
        website,
        "socialLinks",
        "isVerified",
        "followersCount",
        "followingCount",
        "totalViews"
      from users
      where id = $1
      limit 1
    `,
    [userId],
  );

  return (result.rows[0] as Record<string, unknown> | undefined) ?? null;
}

export async function updateCreatorProfileNeon(input: {
  userId: string;
  name: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  socialLinks: Record<string, string>;
}) {
  const result = await queryNeon(
    `
      update users
      set
        name = $2,
        username = $3,
        bio = $4,
        "avatarUrl" = $5,
        "coverUrl" = $6,
        website = $7,
        "socialLinks" = $8::jsonb,
        "isCreator" = true,
        "updatedAt" = now()
      where id = $1
      returning username
    `,
    [
      input.userId,
      input.name,
      input.username,
      input.bio || null,
      input.avatarUrl,
      input.coverUrl,
      input.website,
      JSON.stringify(input.socialLinks),
    ],
  );

  return result.rows[0] as { username: string } | undefined;
}

export async function createPostNeon(input: {
  authorId: string;
  content: string;
  subject: string | null;
  tags: string[];
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  mediaUrls: string[];
}) {
  const result = await queryNeon(
    `
      insert into posts (
        id, content, "mediaUrls", subject, tags, visibility, views, likes, shares, "authorId", "createdAt", "updatedAt"
      )
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5::"VideoVisibility", 0, 0, 0, $6, now(), now())
      returning id, content, tags, visibility, "createdAt"
    `,
    [input.content, input.mediaUrls, input.subject, input.tags, input.visibility, input.authorId],
  );
  return result.rows[0];
}

export async function createReelNeon(input: {
  authorId: string;
  title: string;
  description: string | null;
  subject: string | null;
  tags: string[];
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
}) {
  const result = await queryNeon(
    `
      insert into reels (
        id, title, description, subject, tags, "videoUrl", "thumbnailUrl", duration, visibility, views, likes, shares, "authorId", "createdAt", "updatedAt"
      )
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5, $6, $7, $8::"VideoVisibility", 0, 0, 0, $9, now(), now())
      returning id
    `,
    [input.title, input.description, input.subject, input.tags, input.videoUrl, input.thumbnailUrl, input.duration, input.visibility, input.authorId],
  );
  return result.rows[0] as { id: string } | undefined;
}

export async function createVideoNeon(input: {
  title: string;
  description: string | null;
  type: string;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  subject: string | null;
  tags: string[];
  objectKey: string;
  streamUrl: string | null;
  duration: number | null;
  thumbnailUrl: string | null;
  uploadedById: string;
}) {
  const result = await queryNeon(
    `
      insert into videos (
        id, title, description, type, visibility, subject, tags, "objectKey", "streamUrl", duration, "thumbnailUrl", views, likes, "uploadedById", "createdAt", "updatedAt"
      )
      values (concat('sql_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3::"VideoType", $4::"VideoVisibility", $5, $6, $7, $8, $9, $10, 0, 0, $11, now(), now())
      returning id
    `,
    [
      input.title,
      input.description,
      input.type,
      input.visibility,
      input.subject,
      input.tags,
      input.objectKey,
      input.streamUrl,
      input.duration,
      input.thumbnailUrl,
      input.uploadedById,
    ],
  );
  return result.rows[0] as { id: string } | undefined;
}

export async function listVideosByAuthorNeon(userId: string) {
  const result = await queryNeon(
    `
      select
        id, title, description, type, visibility, subject, tags, "objectKey", "streamUrl", duration, "thumbnailUrl",
        views, likes, "createdAt"
      from videos
      where "uploadedById" = $1 and "deletedAt" is null
      order by "createdAt" desc
      limit 100
    `,
    [userId],
  );
  return result.rows;
}

export async function listPublicReelsNeon(limit: number) {
  const result = await queryNeon(
    `
      select
        r.id, r.title, r.description, r.subject, r.tags, r."videoUrl", r."thumbnailUrl", r.duration, r.visibility,
        r.views, r.likes, 0 as saves, r.shares, r."createdAt",
        u.id as "authorId", u.name as "authorName", u.username as "authorUsername", u."avatarUrl" as "authorAvatarUrl", u."isVerified" as "authorVerified"
      from reels r
      join users u on u.id = r."authorId"
      where r."deletedAt" is null and r.visibility = 'PUBLIC'
      order by r."createdAt" desc
      limit $1
    `,
    [limit],
  );
  return result.rows;
}
