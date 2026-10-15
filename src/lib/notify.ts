import { prisma } from "@/lib/prisma";

export type NotificationType = "problem";

export async function notify(userId: string, type: NotificationType, title: string, body: string, link?: string): Promise<void> {
  try {
    await prisma.problemNotification.create({ data: { userId, type, title, body, link: link ?? null } });
  } catch (error) {
    // Notification failures must never break judging responses.
    console.error("[problem-notify] Failed to save notification:", error);
  }
}
