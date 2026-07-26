import { Router, type IRouter } from "express";
import { GeneratePromptBody, RefinePromptBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

const PLAN_AI_LIMITS: Record<string, number> = {
  basic: 10,
  pro: 50,
  premium: 200,
};

// In-memory usage tracking (resets on server restart; use DB/Redis in production)
const aiUsageMap = new Map<number, number>();

// ─── Gemini client (lazy-initialised so the server starts even without a key) ─
function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-1.5-flash" });
}

// ─── Fallback template generation ────────────────────────────────────────────
const TEMPLATES: Record<string, string[]> = {
  marketing: [
    "Atue como especialista em marketing digital sênior. Crie uma estratégia completa de 30 dias para {topic} que inclua: mídias sociais, email marketing, SEO e paid traffic. Para cada canal, defina objetivo, tipo de conteúdo, frequência e KPI de sucesso.",
    "Desenvolva uma campanha de lançamento para {topic} com cronograma de 4 semanas, definição de público-alvo detalhado, mensagens-chave por persona e métricas de conversão.",
  ],
  copywriting: [
    "Você é um copywriter de resposta direta com 15 anos de experiência. Escreva uma copy persuasiva para {topic} usando: headline de impacto, storytelling emocional, prova social, quebra de objeções e CTA irresistível. Tom: direto, urgente e empático.",
    "Crie um email de vendas de alta conversão sobre {topic}. Estrutura: subject line (A/B com 3 opções), abertura com gancho, desenvolvimento com storytelling, oferta e bônus, garantia e CTA. Máximo 500 palavras.",
  ],
  codigo: [
    "Você é um engenheiro de software sênior especializado em {topic}. Implemente uma solução completa em TypeScript com: tipagem forte, testes unitários (Jest), documentação JSDoc, tratamento de erros e princípios SOLID. Explique cada decisão de design.",
    "Revise e otimize o código para {topic}: analise performance (Big O), segurança (OWASP), legibilidade (Clean Code) e manutenibilidade. Forneça o código refatorado com comentários explicando cada melhoria.",
  ],
  negocios: [
    "Como consultor de negócios estratégico, crie um plano completo para {topic} com: análise de mercado (TAM/SAM/SOM), proposta de valor única, modelo de receita, estratégia go-to-market e projeção financeira para 12 meses.",
    "Desenvolva uma análise SWOT detalhada para {topic} com pelo menos 5 itens por quadrante e um plano de ação específico para capitalizar as oportunidades e mitigar as ameaças.",
  ],
  design: [
    "Descreva um sistema de design completo para {topic}: paleta de cores (primária, secundária, neutros e semânticas), tipografia (fontes, tamanhos, peso, espaçamento), componentes UI essenciais e princípios de acessibilidade (WCAG AA).",
    "Crie um briefing criativo detalhado para {topic}: público-alvo, personalidade da marca (5 adjetivos), referências visuais, moodboard textual, paleta de cores com códigos hex e diretrizes de estilo.",
  ],
  produtividade: [
    "Crie um sistema de produtividade personalizado para {topic} integrando GTD, Pomodoro e Deep Work: rotina matinal de 30 min, blocos de trabalho focado, rituais de fim de semana, templates de planejamento semanal e métricas de auto-avaliação.",
    "Desenvolva um plano de 90 dias para dominar {topic}: metas SMART por mês, marcos semanais mensuráveis, recursos de aprendizado (livros, cursos, comunidades), sistema de revisão e checklist de progresso.",
  ],
  "redes-sociais": [
    "Crie 30 ideias de conteúdo para {topic} nas redes sociais. Para cada uma: plataforma, formato (Reels/Carrossel/Post), hook de abertura, estrutura do conteúdo, hashtags e melhor horário de postagem.",
    "Desenvolva uma estratégia de crescimento orgânico para {topic} no Instagram: pilares de conteúdo, calendário editorial de 4 semanas, scripts de Reels, estratégia de engajamento e métricas de acompanhamento.",
  ],
  educacao: [
    "Crie um currículo completo de aprendizado sobre {topic}: objetivos de aprendizagem, módulos sequenciais, exercícios práticos, projetos de fixação, recursos complementares e critérios de avaliação.",
    "Desenvolva um plano de aula interativo sobre {topic}: objetivos SMART, atividades de aquecimento, desenvolvimento do conteúdo com exemplos reais, dinâmica de grupo e avaliação formativa.",
  ],
};

function templateGenerate(topic: string, category: string): { content: string; title: string; suggestedTags: string[] } {
  const catKey = category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  const templates = TEMPLATES[catKey] || TEMPLATES.marketing;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const content = template.replace(/{topic}/g, topic);
  const title = `Prompt para ${topic.charAt(0).toUpperCase() + topic.slice(1)}`;
  const suggestedTags = [catKey, ...topic.split(" ").slice(0, 2), "ia"].filter(Boolean).slice(0, 4);
  return { content, title, suggestedTags };
}

// ─── Gemini generation ────────────────────────────────────────────────────────
async function geminiGenerate(
  topic: string,
  category: string,
  style?: string,
): Promise<{ content: string; title: string; suggestedTags: string[] }> {
  const model = getGemini();
  if (!model) return templateGenerate(topic, category);

  const styleHint = style ? `Tom e estilo desejado: ${style}.` : "";

  const systemPrompt = `Você é um especialista em engenharia de prompts para IAs generativas (ChatGPT, Claude, Gemini).
Sua missão é criar prompts altamente eficazes, estruturados e prontos para uso imediato.
Um bom prompt deve: definir claramente o papel da IA, especificar o objetivo, o formato de saída e o tom desejado.
Responda SOMENTE em JSON válido, sem markdown, sem \`\`\` — apenas o objeto JSON puro.`;

  const userMessage = `Crie um prompt profissional de alto impacto sobre o seguinte tema: "${topic}".
Categoria: ${category}.
${styleHint}

Responda com este JSON exato:
{
  "title": "Título descritivo do prompt (máximo 80 caracteres)",
  "content": "O prompt completo e detalhado, pronto para ser colado em uma IA. Deve ter pelo menos 150 palavras, incluir instrução de papel/persona, contexto, objetivo específico, formato de saída e exemplos se necessário.",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4"]
}`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userMessage },
  ]);

  const raw = result.response.text().trim();

  // Strip potential markdown fences
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  const parsed = JSON.parse(jsonText);

  return {
    title: String(parsed.title ?? `Prompt para ${topic}`),
    content: String(parsed.content ?? ""),
    suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags.map(String).slice(0, 5) : [],
  };
}

// ─── Gemini refine ────────────────────────────────────────────────────────────
async function geminiRefine(content: string, instruction: string): Promise<{ content: string; title: string; suggestedTags: string[] }> {
  const model = getGemini();
  if (!model) {
    const refined = `${content}\n\n[Refinamento: ${instruction}]\n\nAdicione exemplos práticos e específicos. Use linguagem clara e persuasiva. Estruture com bullet points quando necessário.`;
    return { content: refined, title: "Prompt Refinado com IA", suggestedTags: ["refinado", "ia", "otimizado"] };
  }

  const prompt = `Você é um especialista em engenharia de prompts. Refine o prompt abaixo seguindo a instrução dada.

PROMPT ORIGINAL:
${content}

INSTRUÇÃO DE REFINAMENTO:
${instruction}

Responda SOMENTE em JSON puro (sem markdown):
{
  "title": "Título atualizado do prompt",
  "content": "Versão refinada e melhorada do prompt",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(jsonText);

  return {
    title: String(parsed.title ?? "Prompt Refinado"),
    content: String(parsed.content ?? content),
    suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags.map(String).slice(0, 5) : ["refinado", "ia"],
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────
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

  const { topic, category = "marketing", style } = parsed.data;

  try {
    const result = await geminiGenerate(topic, category, style);
    aiUsageMap.set(userId, used + 1);
    res.json(result);
  } catch (err) {
    // Fallback to template if Gemini fails
    console.error("Gemini generate error, using fallback:", err);
    const fallback = templateGenerate(topic, category);
    aiUsageMap.set(userId, used + 1);
    res.json(fallback);
  }
});

router.post("/ai/refine", requireAuth, async (req, res): Promise<void> => {
  const parsed = RefinePromptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { content, instruction } = parsed.data;

  try {
    const result = await geminiRefine(content, instruction);
    res.json(result);
  } catch (err) {
    console.error("Gemini refine error, using fallback:", err);
    const refined = `${content}\n\n[Refinamento: ${instruction}]\n\nAdicione exemplos práticos. Use linguagem clara e persuasiva.`;
    res.json({ content: refined, title: "Prompt Refinado", suggestedTags: ["refinado", "ia"] });
  }
});

export default router;
