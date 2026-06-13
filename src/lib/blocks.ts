import { prisma } from "@/lib/prisma";

/** User ids who have blocked `userId` (e.g. organizers who blocked this applicant). */
export async function getBlockerIdsOf(userId: string): Promise<string[]> {
  const rows = await prisma.block.findMany({
    where: { blockedId: userId },
    select: { blockerId: true },
  });
  return rows.map((r) => r.blockerId);
}

/** All user ids that are in a block relationship with `userId` (either direction). */
export async function getBlockRelatedIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  const ids = new Set<string>();
  for (const r of rows) {
    ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  }
  return ids;
}

/** True if a block exists between the two users (either direction). */
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const row = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: a, blockedId: b },
        { blockerId: b, blockedId: a },
      ],
    },
    select: { id: true },
  });
  return !!row;
}
