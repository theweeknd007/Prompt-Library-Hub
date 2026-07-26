import { Router, type IRouter } from "express";
import { db, subscriptionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateSubscriptionBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const PLANS = [
  {
    id: 1,
    name: "Básico",
    slug: "basic",
    price: 5,
    promptsLimit: 50,
    aiGenerationsLimit: 10,
    sharingEnabled: false,
    exclusiveTemplates: "none",
    description: "Perfeito para começar. Acesse até 50 prompts e gere com IA.",
  },
  {
    id: 2,
    name: "Pro",
    slug: "pro",
    price: 10,
    promptsLimit: 200,
    aiGenerationsLimit: 50,
    sharingEnabled: true,
    exclusiveTemplates: "partial",
    description: "Para criadores sérios. 200 prompts, compartilhamento e templates exclusivos parciais.",
  },
  {
    id: 3,
    name: "Premium",
    slug: "premium",
    price: 15,
    promptsLimit: null,
    aiGenerationsLimit: 200,
    sharingEnabled: true,
    exclusiveTemplates: "full",
    description: "Sem limites. Prompts ilimitados, IA avançada e todos os templates exclusivos.",
  },
];

router.get("/plans", (_req, res): void => {
  res.json(PLANS);
});

router.get("/subscription", requireAuth, async (req, res): Promise<void> => {
  const userId = req.auth!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const plan = PLANS.find((p) => p.slug === (user?.plan ?? "basic")) ?? PLANS[0];

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId))
    .orderBy(subscriptionsTable.createdAt);

  res.json({
    planSlug: plan.slug,
    planName: plan.name,
    price: plan.price,
    status: sub?.status ?? "active",
    createdAt: sub?.createdAt?.toISOString() ?? new Date().toISOString(),
    expiresAt: sub?.expiresAt?.toISOString() ?? null,
  });
});

router.post("/subscription", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.auth!.userId;
  const planSlug = parsed.data.planSlug;
  const plan = PLANS.find((p) => p.slug === planSlug);
  if (!plan) {
    res.status(400).json({ error: "Plano inválido" });
    return;
  }

  // Update user plan
  await db.update(usersTable).set({ plan: planSlug }).where(eq(usersTable.id, userId));

  // Create or update subscription
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const [sub] = await db
    .insert(subscriptionsTable)
    .values({ userId, planSlug, status: "active", expiresAt })
    .returning();

  res.json({
    planSlug: plan.slug,
    planName: plan.name,
    price: plan.price,
    status: sub.status,
    createdAt: sub.createdAt.toISOString(),
    expiresAt: sub.expiresAt?.toISOString() ?? null,
  });
});

export default router;
