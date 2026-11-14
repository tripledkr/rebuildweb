import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import site from '../site.config.mjs';

/* /llms.txt — AI 답변 엔진이 사이트를 요약해 인용할 때 참고하는 요약 문서 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection('columns', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const body = `# 리빌드웹

> 오래된 기업 홈페이지를 구조부터 다시 만드는 홈페이지 리뉴얼 서비스입니다.
> 상담부터 오픈까지 2주를 기준으로 진행하며, 오픈 후에는 회사 담당자가 직접 운영할 수 있도록 1:1 교육까지 제공합니다.

## 무엇을 하는 서비스인가

리빌드웹은 기업 홈페이지 리뉴얼을 전담합니다. 디자인만 바꾸는 것이 아니라
메뉴 구조와 페이지 구성, 회사 소개 문구부터 다시 설계한 뒤 화면을 만듭니다.
작업 범위는 메뉴 구조 재설계, 회사 소개 카피 정리, PC·모바일 디자인,
문의까지 이어지는 동선 설계, 검색 노출 기본 설정, 운영 교육 여섯 가지입니다.

## 언제 리뉴얼이 필요한가

다음 중 두 가지 이상에 해당하면 리뉴얼을 검토할 시점입니다.
모바일에서 글자가 작거나 화면이 깨진다. 회사 소개와 실적이 몇 년 전 내용에 멈춰 있다.
홈페이지를 통한 문의가 거의 없다. 문구 하나 바꾸려 해도 제작 업체에 연락해야 한다.
회사 이름으로 검색해도 홈페이지가 잘 나오지 않는다. 거래처에 주소를 알려주기가 망설여진다.

## 진행 방식

상담과 자료 정리(1~2일), 구조 설계(3~4일), 디자인(5~7일),
개발과 반응형 구현(8~11일), 오픈과 운영 교육(12~14일) 순서로 진행합니다.
기간은 자료 준비 상황과 작업 스케줄에 따라 달라질 수 있습니다.

## 운영

오픈 후 2개월 동안 무상 케어를 제공하며, 관리자 페이지 사용법을 1:1로 안내해
문구와 이미지, 게시글을 회사에서 직접 수정할 수 있게 합니다.
사이트와 도메인은 회사 명의로 만들어 운영 권한이 회사에 남습니다.

## 문의

전화 ${site.contact.tel}
카카오톡 상담 ${site.contact.kakao}
운영 ${site.business.company}

## 칼럼

${posts.map((p) => `- [${p.data.title}](${site.url}/columns/${p.id}): ${p.data.description}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
