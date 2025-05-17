# 랜덤 음식 추첨기  
매일 점심과 저녁 메뉴를 랜덤으로 추천해주는 간단한 웹 서비스입니다.

## 사용 기술

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Java, Spring Boot, JPA  
- **Database**: PostgreSQL  
- **Infra**: Docker

## 배포 주소  
👉 [https://dalcol.shop](https://dalcol.shop)

## 개선 예정 사항

### 2025-05-12
1. ~~서버 재시작 시 세션이 유지되어 정보가 초기화되지 않음 → 세션/캐시 정리 필요~~
2. ~~점심/저녁 메뉴 구분 컬럼을 DB에 추가 예정~~
3. ~~해외 IP 접속 차단 기능 도입 (오후 6시 ~ 오후 7시 이후)~~

### 2025-05-17
1. K6 부하테스트 임계점 찾기
2. 성능개선
