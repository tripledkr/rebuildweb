/* 사이트 기본 정보 : 배포 전 [ ] 항목을 실제 값으로 교체 */
export default {
  name: '리빌드웹',
  logo: 'REBUILDWEB', // 헤더·푸터에 보이는 로고 표기
  url: 'https://rebuildweb.vercel.app', // 실제 도메인으로 교체
  keyword: '기업 홈페이지 리뉴얼',
  theme: {
    accent: '#1F3FD1',
    accentSoft: '#EEF1FD',
    bg: '#FFFFFF',
  },
  nav: [
    { label: '리뉴얼 체크', href: '/#signs' },
    { label: '바뀌는 점', href: '/#scope' },
    { label: '진행 과정', href: '/#process' },
    { label: '칼럼', href: '/columns' },
  ],
  contact: {
    tel: '0507-1356-9136',
    kakao: 'https://pf.kakao.com/_DGHln/chat',
    formEndpoint: 'https://script.google.com/macros/s/AKfycbxTRQZs3f7eKw4wxUQHzqn-rumZPDHZAGW7ZF57vc0VfHegwwL8JmqudEse45xOVhwy/exec',
    privacyPeriod: '상담 종료 후 1년',
  },
  business: {
    company: '스튜디오 트리플디',
    ceo: '김주희',
  },
  verify: {
    naver: '', // 네이버 서치어드바이저 사이트 소유확인 코드
    google: '', // 구글 서치콘솔 소유확인 코드
  },
  columns: {
    title: '기업 홈페이지 리뉴얼 칼럼',
    description: '홈페이지 리뉴얼 시기, 준비 자료, 진행 방법까지 회사 담당자가 알아두면 좋은 내용을 정리합니다.',
    ctaTitle: '우리 회사 홈페이지도 리뉴얼이 필요할까요?',
    ctaText: '지금 홈페이지 주소만 알려주시면 무엇부터 바꾸면 좋을지 정리해 드립니다.',
  },
};
