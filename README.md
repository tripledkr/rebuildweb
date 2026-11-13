# 검색 유입용 랜딩 사이트 (Astro + Vercel)

## 1. 배포 전에 수정할 것
`src/site.config.mjs`
- `url` : 실제 도메인 (예: https://도메인.kr)
- `business` : 상호, 대표자명, 사업자등록번호, 주소
- `contact.formUrl` : 구글폼 등 문의폼 주소가 생기면 교체 (지금은 메일 보내기로 연결됨)
- `verify` : 네이버 서치어드바이저 · 구글 서치콘솔 소유확인 코드 (등록 후 입력)

`public/og.png` : 카카오톡 · SNS 공유 이미지 (1200x630). 필요하면 교체.

## 2. 버셀 배포
1. 이 폴더를 GitHub 새 저장소로 올립니다.
2. vercel.com 에서 Add New → Project → 저장소 선택 → Deploy (Astro 자동 인식, 설정 변경 없음)
3. Settings → Domains 에서 구매한 도메인 연결
4. 이후 GitHub에 파일이 바뀌면 자동으로 다시 배포됩니다.

## 3. 검색엔진 등록 (오픈 직후 1회)
- 네이버 서치어드바이저: 사이트 등록 → 소유확인 코드를 `verify.naver`에 입력 → 사이트맵 제출 `https://도메인/sitemap-index.xml`
- 구글 서치콘솔: 속성 추가 → 소유확인 코드를 `verify.google`에 입력 → 같은 사이트맵 제출

## 4. 칼럼 올리는 법
- `src/content/columns/` 폴더에 `.md` 파일 하나 = 칼럼 한 편 (파일 이름이 주소가 됩니다)
- 상단 정보(title, description, keyword, category, date)를 채웁니다.
- `draft: true` 인 글은 배포되지 않습니다. 직접 경험 문단을 넣고 `draft: false`로 바꾸면 공개됩니다.
- 본문의 `<!-- 직접 경험 넣기 -->` 자리에 실제 사례를 2~3문장 넣어 주세요. 검색 품질 평가에 중요합니다.

## 5. 로컬 확인 (선택)
```
npm install
npm run dev      # 공개 글만
SHOW_DRAFTS=true npm run dev   # 초안 포함 미리보기
```
