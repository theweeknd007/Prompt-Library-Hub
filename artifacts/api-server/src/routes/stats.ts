import { Router, type IRouter } from "express";
import { db, promptsTable, favoritesTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const PLAN_LIMITS: Record<string, { prompts: number | null; ai: number }> = {
  basic: { prompts: 50, ai: 10 },
  pro: { prompts: 200, ai: 50 },
  premium: { prompts: null, ai: 200 },
};

const aiUsageMap = new Map<number, number>(); // shared with ai.ts in prod would be Redis

router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const plan = (user?.plan ?? "basic") as "basic" | "pro" | "premium";
  const limits = PLAN_LIMITS[plan];

  const [totalRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(promptsTable)
    .where(eq(promptsTable.userId, userId));

  const [publicRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(promptsTable)
    .where(and(eq(promptsTable.userId, userId), eq(promptsTable.visibility, "public")));

  const [privateRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(promptsTable)
    .where(and(eq(promptsTable.userId, userId), eq(promptsTable.visibility, "private")));

  const [favRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, userId));

  const [usesRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(${promptsTable.useCount}), 0) as int)` })
    .from(promptsTable)
    .where(eq(promptsTable.userId, userId));

  const [likesRow] = await db
    .select({ total: sql<number>`cast(coalesce(sum(${promptsTable.likeCount}), 0) as int)` })
    .from(promptsTable)
    .where(eq(promptsTable.userId, userId));

  res.json({
    totalPrompts: totalRow?.count ?? 0,
    favoritePrompts: favRow?.count ?? 0,
    publicPrompts: publicRow?.count ?? 0,
    privatePrompts: privateRow?.count ?? 0,
    totalUses: usesRow?.total ?? 0,
    totalLikes: likesRow?.total ?? 0,
    aiGenerationsUsed: aiUsageMap.get(userId) ?? 0,
    aiGenerationsLimit: limits.ai,
    promptsLimit: limits.prompts,
  });
});

export default router;
