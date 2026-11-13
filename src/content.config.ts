import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/* 칼럼: src/content/columns 폴더에 .md 파일을 추가하면 페이지가 자동 생성됩니다. */
const columns = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/columns' }),
  schema: z.object({
    title: z.string(),              // 검색 제목 (키워드를 앞쪽에)
    description: z.string(),        // 검색 설명 (80~120자)
    keyword: z.string(),            // 대표 키워드
    category: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false), // true면 배포되지 않음
  }),
});

export const collections = { columns };
