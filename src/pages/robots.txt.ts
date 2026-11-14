import type { APIRoute } from 'astro';

/* 일반 검색엔진과 AI 답변 엔진 모두 수집을 허용합니다.
   AI 크롤러는 와일드카드만으로 판단하지 않는 경우가 있어 이름을 따로 적습니다. */
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'CCBot', 'Amazonbot', 'Bytespider', 'cohere-ai', 'Meta-ExternalAgent',
];

const SEARCH_AGENTS = ['Googlebot', 'Bingbot', 'Yeti', 'Daumoa', 'DuckDuckBot'];

export const GET: APIRoute = ({ site }) => {
  const blocks = [
    'User-agent: *\nAllow: /',
    ...SEARCH_AGENTS.map((a) => `User-agent: ${a}\nAllow: /`),
    ...AI_AGENTS.map((a) => `User-agent: ${a}\nAllow: /`),
  ];
  const body =
    blocks.join('\n\n') +
    `\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
