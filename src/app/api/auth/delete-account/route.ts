import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Soft delete approach: deactivate account and anonymize data
    // This preserves content but removes personal info
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        name: "Deleted User",
        email: `deleted_${userId}@wohotech.in`,
        username: null,
        bio: null,
        avatarUrl: null,
        coverUrl: null,
        website: null,
        socialLinks: Prisma.DbNull,
        password: null,
      },
    });

    // Delete notifications
    await prisma.notification.deleteMany({
      where: { userId },
    });

    // Delete follows (both directions)
    await prisma.follow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    });

    // Delete saved content
    await prisma.savedContent.deleteMany({
      where: { userId },
    });

    // Delete likes
    await prisma.contentLike.deleteMany({
      where: { userId },
    });

    // Soft-delete all user content
    const now = new Date();
    await prisma.post.updateMany({
      where: { authorId: userId, deletedAt: null },
      data: { deletedAt: now },
    });
    await prisma.reel.updateMany({
      where: { authorId: userId, deletedAt: null },
      data: { deletedAt: now },
    });
    await prisma.video.updateMany({
      where: { uploadedById: userId, deletedAt: null },
      data: { deletedAt: now },
    });

    return NextResponse.json({
      ok: true,
      message: "Account deleted successfully. You will be logged out.",
    });
  } catch (error) {
    console.error("[auth/delete-account]", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again later." },
      { status: 500 }
    );
  }
}
