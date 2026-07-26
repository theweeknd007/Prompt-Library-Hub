import { Router, type IRouter } from "express";
import { db, categoriesTable, promptsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateCategoryBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      icon: categoriesTable.icon,
      promptCount: sql<number>`cast(count(${promptsTable.id}) as int)`,
    })
    .from(categoriesTable)
    .leftJoin(
      promptsTable,
      eq(promptsTable.categoryId, categoriesTable.id),
    )
    .groupBy(categoriesTable.id)
    .orderBy(categoriesTable.name);

  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon ?? null,
      promptCount: r.promptCount ?? 0,
    })),
  );
});

router.post("/categories", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon ?? null, promptCount: 0 });
});

export default router;
