import { Router, type IRouter } from "express";
import { GeneratePromptBody, RefinePromptBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const PLAN_AI_LIMITS: Record<string, number> = {
  basic: 10,
  pro: 50,
  premium: 200,
};

// In-memory usage tracking (resets on server restart; for production use Redis/DB)
const aiUsageMap = new Map<number, number>();

// Prompt templates by category
const TEMPLATES: Record<string, string[]> = {
  marketing: [
    "Crie uma estratégia de marketing digital para {topic} que inclua mídias sociais, email marketing e SEO. Foque em aumentar o engajamento e conversões em 30%.",
    "Desenvolva uma campanha de lançamento completa para {topic} com cronograma de 30 dias, definição de público-alvo e KPIs mensuráveis.",
  ],
  copywriting: [
    "Escreva uma copy persuasiva para {topic} que use gatilhos emocionais, prova social e chamada para ação irresistível. Target: empreendedores digitais.",
    "Crie um email de vendas de alta conversão sobre {topic} com subject line poderosa, storytelling envolvente e CTA claro.",
  ],
  codigo: [
    "Você é um engenheiro sênior. Implemente {topic} em TypeScript com testes unitários, documentação JSDoc e seguindo os princípios SOLID.",
    "Revise e otimize o seguinte código de {topic}: considere performance, segurança, legibilidade e manutenibilidade.",
  ],
  negocios: [
    "Crie um plano de negócios completo para {topic} incluindo análise de mercado, proposta de valor, modelo de receita e estratégia de crescimento.",
    "Desenvolva uma análise SWOT detalhada para {topic} com ações estratégicas específicas para cada quadrante.",
  ],
  design: [
    "Descreva um sistema de design completo para {topic} incluindo paleta de cores, tipografia, componentes e princípios de UX.",
    "Crie um briefing criativo para o design de {topic} com referências visuais, moodboard e diretrizes de estilo.",
  ],
  produtividade: [
    "Crie um sistema de produtividade pessoal para {topic} baseado nas metodologias GTD, Pomodoro e Deep Work. Inclua templates e rotinas diárias.",
    "Desenvolva um plano de 90 dias para dominar {topic} com metas SMART, marcos semanais e sistema de revisão.",
  ],
};

function generatePromptContent(topic: string, category: string): { content: string; title: string; suggestedTags: string[] } {
  const catKey = category.toLowerCase().replace(/\s+/g, "");
  const templates = TEMPLATES[catKey] || TEMPLATES.marketing;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const content = template.replace(/{topic}/g, topic);
  const title = `Prompt para ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const suggestedTags = [category, topic.split(" ")[0], "ia", "prompt"].filter(Boolean).slice(0, 4);
  return { content, title, suggestedTags };
}

router.post("/ai/generate", requireAuth, async (req, res): Promise<void> => {
  const parsed = GeneratePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = req.auth!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const plan = (user?.plan ?? "basic") as "basic" | "pro" | "premium";
  const limit = PLAN_AI_LIMITS[plan];
  const used = aiUsageMap.get(userId) ?? 0;

  if (used >= limit) {
    res.status(429).json({ error: `Limite de ${limit} gerações de IA por mês atingido no plano ${plan}` });
    return;
  }
  aiUsageMap.set(userId, used + 1);

  const { topic, category = "marketing" } = parsed.data;
  const result = generatePromptContent(topic, category);
  res.json(result);
});

router.post("/ai/refine", requireAuth, async (req, res): Promise<void> => {
  const parsed = RefinePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { content, instruction } = parsed.data;
  const refinedContent = `${content}\n\n[Refinamento aplicado: ${instruction}]\n\nAdicione exemplos práticos e específicos. Seja mais direto e acionável. Use linguagem clara e persuasiva. Estruture com bullet points quando necessário para maior clareza.`;
  const title = "Prompt Refinado com IA";
  const suggestedTags = ["refinado", "ia", "otimizado"];
  res.json({ content: refinedContent, title, suggestedTags });
});

export default router;
