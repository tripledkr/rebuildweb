/* 사이트 기본 정보 : 배포 전 [ ] 항목을 실제 값으로 교체 */
export default {
  name: '리빌드웹',
  url: 'https://rebuildweb.vercel.app', // 실제 도메인으로 교체
  keyword: '기업 홈페이지 리뉴얼',
  theme: {
    accent: '#1F3FD1',
    accentSoft: '#EEF1FD',
    bg: '#FFFFFF',
  },
  nav: [
    { label: '리뉴얼 신호', href: '/#signs' },
    { label: '진행 과정', href: '/#process' },
    { label: '자주 묻는 질문', href: '/#faq' },
    { label: '칼럼', href: '/columns' },
  ],
  contact: {
    formEndpoint: 'https://script.google.com/macros/s/AKfycbxTRQZs3f7eKw4wxUQHzqn-rumZPDHZAGW7ZF57vc0VfHegwwL8JmqudEse45xOVhwy/exec', // 구글 Apps Script 웹 앱 주소 (입력하면 사이트 안 문의 폼이 표시됨)
    privacyPeriod: '상담 종료 후 1년', // 개인정보 보유 기간
    tel: '010-3080-9136',
    email: 'tripled_kr@naver.com',
    formUrl: 'mailto:tripled_kr@naver.com?subject=%5B%EB%A6%AC%EB%B9%8C%EB%93%9C%EC%9B%B9%5D%20%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80%20%EB%A6%AC%EB%89%B4%EC%96%BC%20%EC%83%81%EB%8B%B4', // 구글폼 등 문의폼 주소가 있으면 교체
  },
  business: {
    company: '[상호]',
    ceo: '[대표자명]',
    bizNo: '[000-00-00000]',
    address: '[사업장 주소]',
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
