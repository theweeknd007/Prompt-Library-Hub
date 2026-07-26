import { Router, type IRouter } from "express";
import { db, promptsTable, categoriesTable, favoritesTable, likesTable, usersTable } from "@workspace/db";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import {
  ListPromptsQueryParams,
  CreatePromptBody,
  GetPromptParams,
  UpdatePromptParams,
  UpdatePromptBody,
  DeletePromptParams,
  ToggleFavoriteParams,
  ToggleLikeParams,
  ListPopularPromptsQueryParams,
  ListRecentPromptsQueryParams,
  RecordUseParams,
} from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function formatPrompt(
  row: typeof promptsTable.$inferSelect,
  userId: number | undefined,
  categoryName: string,
  authorName: string | null,
) {
  let isFavorite = false;
  if (userId) {
    const [fav] = await db
      .select()
      .from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.promptId, row.id)));
    isFavorite = Boolean(fav);
  }
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    description: row.description ?? null,
    categoryId: row.categoryId,
    categoryName,
    tags: row.tags ?? [],
    visibility: row.visibility as "public" | "private",
    isFavorite,
    likeCount: row.likeCount,
    useCount: row.useCount,
    rating: parseFloat(row.rating),
    authorName: authorName ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// List prompts (own + public)
router.get("/prompts", optionalAuth, async (req, res): Promise<void> => {
  const parsed = ListPromptsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, search, visibility, favorites, page = 1, limit = 20 } = parsed.data;
  const userId = req.auth?.userId;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  if (favorites === "true" && userId) {
    // Only favorited prompts
    const favRows = await db.select().from(favoritesTable).where(eq(favoritesTable.userId, userId));
    const favIds = favRows.map((f) => f.promptId);
    if (favIds.length === 0) {
      res.json({ prompts: [], total: 0, page, limit });
      return;
    }
    conditions.push(sql`${promptsTable.id} = ANY(${favIds})`);
  } else if (userId) {
    if (visibility === "private") {
      conditions.push(and(eq(promptsTable.userId, userId), eq(promptsTable.visibility, "private")));
    } else if (visibility === "public") {
      conditions.push(eq(promptsTable.visibility, "public"));
    } else if (visibility === "all") {
      // own + all public
      conditions.push(or(eq(promptsTable.userId, userId), eq(promptsTable.visibility, "public")));
    } else {
      // default: own prompts
      conditions.push(eq(promptsTable.userId, userId));
    }
  } else {
    conditions.push(eq(promptsTable.visibility, "public"));
  }

  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
    if (cat) conditions.push(eq(promptsTable.categoryId, cat.id));
  }

  if (search) {
    conditions.push(
      or(
        ilike(promptsTable.title, `%${search}%`),
        ilike(promptsTable.content, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const rows = await db
    .select({
      prompt: promptsTable,
      categoryName: categoriesTable.name,
      authorName: usersTable.name,
    })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(whereClause)
    .orderBy(desc(promptsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const totalRows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .where(whereClause);

  const total = totalRows[0]?.count ?? 0;

  const prompts = await Promise.all(
    rows.map((r) => formatPrompt(r.prompt, userId, r.categoryName, r.authorName)),
  );

  res.json({ prompts, total, page, limit });
});

// Popular prompts (public, sorted by use_count)
router.get("/prompts/popular", optionalAuth, async (req, res): Promise<void> => {
  const parsed = ListPopularPromptsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, limit = 10 } = parsed.data;
  const userId = req.auth?.userId;

  const conditions = [eq(promptsTable.visibility, "public")];
  if (category) {
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category));
    if (cat) conditions.push(eq(promptsTable.categoryId, cat.id));
  }

  const rows = await db
    .select({
      prompt: promptsTable,
      categoryName: categoriesTable.name,
      authorName: usersTable.name,
    })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(promptsTable.useCount))
    .limit(limit);

  const prompts = await Promise.all(
    rows.map((r) => formatPrompt(r.prompt, userId, r.categoryName, r.authorName)),
  );
  res.json(prompts);
});

// Recent prompts (public, sorted by created_at)
router.get("/prompts/recent", optionalAuth, async (req, res): Promise<void> => {
  const parsed = ListRecentPromptsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { limit = 10 } = parsed.data;
  const userId = req.auth?.userId;

  const rows = await db
    .select({
      prompt: promptsTable,
      categoryName: categoriesTable.name,
      authorName: usersTable.name,
    })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(eq(promptsTable.visibility, "public"))
    .orderBy(desc(promptsTable.createdAt))
    .limit(limit);

  const prompts = await Promise.all(
    rows.map((r) => formatPrompt(r.prompt, userId, r.categoryName, r.authorName)),
  );
  res.json(prompts);
});

// Get single prompt
router.get("/prompts/:id", optionalAuth, async (req, res): Promise<void> => {
  const params = GetPromptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.auth?.userId;
  const [row] = await db
    .select({
      prompt: promptsTable,
      categoryName: categoriesTable.name,
      authorName: usersTable.name,
    })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(eq(promptsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Prompt não encontrado" });
    return;
  }
  // Only accessible if public or owned
  if (row.prompt.visibility === "private" && row.prompt.userId !== userId) {
    res.status(404).json({ error: "Prompt não encontrado" });
    return;
  }
  res.json(await formatPrompt(row.prompt, userId, row.categoryName, row.authorName));
});

// Create prompt
router.post("/prompts", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.auth!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

  // Plan limits
  const PLAN_LIMITS: Record<string, number | null> = { basic: 50, pro: 200, premium: null };
  const limit = PLAN_LIMITS[user?.plan ?? "basic"];
  if (limit !== null) {
    const [countRow] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(promptsTable)
      .where(eq(promptsTable.userId, userId));
    if ((countRow?.count ?? 0) >= limit) {
      res.status(403).json({ error: `Limite de ${limit} prompts atingido no plano ${user?.plan}` });
      return;
    }
  }

  // Sharing check
  const SHARING_ENABLED: Record<string, boolean> = { basic: false, pro: true, premium: true };
  const visibility = parsed.data.visibility ?? "private";
  if (visibility === "public" && !SHARING_ENABLED[user?.plan ?? "basic"]) {
    res.status(403).json({ error: "Compartilhamento não disponível no plano Básico" });
    return;
  }

  const [prompt] = await db
    .insert(promptsTable)
    .values({ ...parsed.data, visibility, userId, rating: "4.5", tags: parsed.data.tags ?? [] })
    .returning();

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, prompt.categoryId));
  res.status(201).json(await formatPrompt(prompt, userId, cat?.name ?? "", user?.name ?? null));
});

// Update prompt
router.patch("/prompts/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdatePromptParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.auth!.userId;
  const [existing] = await db.select().from(promptsTable).where(eq(promptsTable.id, params.data.id));
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: "Prompt não encontrado" });
    return;
  }
  const [updated] = await db
    .update(promptsTable)
    .set(parsed.data)
    .where(eq(promptsTable.id, params.data.id))
    .returning();
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, updated.categoryId));
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.json(await formatPrompt(updated, userId, cat?.name ?? "", user?.name ?? null));
});

// Delete prompt
router.delete("/prompts/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const userId = req.auth!.userId;
  const [existing] = await db.select().from(promptsTable).where(eq(promptsTable.id, id));
  if (!existing || existing.userId !== userId) {
    res.status(404).json({ error: "Prompt não encontrado" });
    return;
  }
  await db.delete(promptsTable).where(eq(promptsTable.id, id));
  res.sendStatus(204);
});

// Toggle favorite
router.patch("/prompts/:id/favorite", requireAuth, async (req, res): Promise<void> => {
  const params = ToggleFavoriteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.auth!.userId;
  const promptId = params.data.id;

  const [existing] = await db
    .select()
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.promptId, promptId)));

  if (existing) {
    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.promptId, promptId)));
  } else {
    await db.insert(favoritesTable).values({ userId, promptId });
  }

  const [row] = await db
    .select({ prompt: promptsTable, categoryName: categoriesTable.name, authorName: usersTable.name })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(eq(promptsTable.id, promptId));

  if (!row) { res.status(404).json({ error: "Prompt não encontrado" }); return; }
  res.json(await formatPrompt(row.prompt, userId, row.categoryName, row.authorName));
});

// Toggle like
router.patch("/prompts/:id/like", optionalAuth, async (req, res): Promise<void> => {
  const params = ToggleLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const userId = req.auth?.userId;
  const promptId = params.data.id;

  if (userId) {
    const [existing] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.promptId, promptId)));

    if (existing) {
      await db.delete(likesTable).where(and(eq(likesTable.userId, userId), eq(likesTable.promptId, promptId)));
      await db.update(promptsTable).set({ likeCount: sql`${promptsTable.likeCount} - 1` }).where(eq(promptsTable.id, promptId));
    } else {
      await db.insert(likesTable).values({ userId, promptId });
      await db.update(promptsTable).set({ likeCount: sql`${promptsTable.likeCount} + 1` }).where(eq(promptsTable.id, promptId));
    }
  }

  const [row] = await db
    .select({ prompt: promptsTable, categoryName: categoriesTable.name, authorName: usersTable.name })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(eq(promptsTable.id, promptId));

  if (!row) { res.status(404).json({ error: "Prompt não encontrado" }); return; }
  res.json(await formatPrompt(row.prompt, userId, row.categoryName, row.authorName));
});

// Record use
router.post("/prompts/:id/use", optionalAuth, async (req, res): Promise<void> => {
  const params = RecordUseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const promptId = params.data.id;
  await db.update(promptsTable).set({ useCount: sql`${promptsTable.useCount} + 1` }).where(eq(promptsTable.id, promptId));

  const [row] = await db
    .select({ prompt: promptsTable, categoryName: categoriesTable.name, authorName: usersTable.name })
    .from(promptsTable)
    .innerJoin(categoriesTable, eq(promptsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(promptsTable.userId, usersTable.id))
    .where(eq(promptsTable.id, promptId));

  if (!row) { res.status(404).json({ error: "Prompt não encontrado" }); return; }
  res.json(await formatPrompt(row.prompt, req.auth?.userId, row.categoryName, row.authorName));
});

export default router;
