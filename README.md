# 프린스 하계휴가 일정표 Netlify 배포 가이드

## 0. 404 Page not found가 뜰 때 먼저 확인할 것

Netlify에서 `Page not found`가 뜨는 가장 흔한 원인은 배포 폴더 안에 `index.html`이 없거나, Publish directory가 잘못 잡힌 경우입니다.

정상 구조는 GitHub 저장소 첫 화면에 아래 파일들이 바로 보여야 합니다.

```txt
index.html
package.json
netlify.toml
_redirects
netlify/functions/vacation-data.mjs
README.md
```

아래처럼 한 단계 폴더 안에 들어가 있으면 404가 날 수 있습니다.

```txt
prince-vacation-netlify/index.html
prince-vacation-netlify/package.json
prince-vacation-netlify/netlify.toml
```

이 경우 해결 방법은 둘 중 하나입니다.

### 해결 방법 A: 파일을 저장소 루트로 옮기기

GitHub 저장소 첫 화면에서 `index.html`이 바로 보이도록 파일을 옮깁니다. 초보자에게는 이 방법이 가장 쉽습니다.

### 해결 방법 B: Netlify 설정에서 Base directory 지정

이미 폴더째 업로드했다면 Netlify에서 아래처럼 설정합니다.

```txt
Base directory: prince-vacation-netlify
Build command: 비워둠
Publish directory: .
Functions directory: netlify/functions
```

변경 후 `Clear cache and deploy site`로 다시 배포하세요.


## 1. 프로젝트 구성

이 ZIP 파일에는 아래 파일이 들어 있습니다.

```txt
prince-vacation-netlify/
├─ index.html
├─ package.json
├─ netlify.toml
├─ _redirects
├─ .gitignore
└─ netlify/
   └─ functions/
      └─ vacation-data.mjs
```

각 파일 역할은 아래와 같습니다.

- `index.html` : 직원들이 보는 휴가 일정표 화면
- `netlify/functions/vacation-data.mjs` : 여러 직원이 같은 데이터를 보게 해주는 서버 기능
- `package.json` : Netlify Blobs 저장 기능 설치 정보
- `netlify.toml` : Netlify 배포 설정
- `_redirects` : 잘못된 하위 경로 접속 시 메인 화면으로 연결

## 2. 관리자 비밀번호

기본 관리자 비밀번호는 아래와 같습니다.

```txt
admin1234
```

운영 중 비밀번호를 바꾸고 싶으면 Netlify 환경변수에 아래 값을 추가하세요.

```txt
ADMIN_PASSWORD=원하는비밀번호
```

단, 프론트 화면의 기본 확인값도 맞춰야 완전히 자연스럽게 동작합니다. 내부용으로만 간단히 사용할 경우 현재 기본값 그대로 사용하면 됩니다.

## 3. 초보자용 배포 순서

### 1단계: ZIP 압축 풀기

다운로드한 ZIP 파일을 압축 해제합니다.

폴더 이름은 예를 들어 아래처럼 두면 됩니다.

```txt
prince-vacation-netlify
```

### 2단계: GitHub에 새 저장소 만들기

1. GitHub 접속
2. 우측 상단 `+` 버튼 클릭
3. `New repository` 클릭
4. Repository name에 아래처럼 입력

```txt
prince-vacation-netlify
```

5. Public 또는 Private 선택
6. `Create repository` 클릭

### 3단계: 파일 업로드

GitHub 저장소 화면에서 아래 순서로 진행합니다.

1. `uploading an existing file` 클릭
2. 압축 푼 폴더 안의 파일 전체 업로드
3. 반드시 아래 구조가 유지되어야 합니다.

```txt
index.html
package.json
netlify.toml
netlify/functions/vacation-data.mjs
```

4. `Commit changes` 클릭

### 4단계: Netlify에서 GitHub 연결 배포

1. Netlify 접속
2. `Add new project` 클릭
3. `Import an existing project` 클릭
4. GitHub 선택
5. 방금 만든 저장소 선택
6. Build settings는 아래처럼 둡니다.

```txt
Build command: 비워둠
Publish directory: .
Functions directory: netlify/functions
```

7. `Deploy` 또는 `Publish` 클릭

### 5단계: 접속 확인

배포가 끝나면 Netlify가 아래와 비슷한 주소를 줍니다.

```txt
https://프로젝트명.netlify.app
```

해당 주소로 접속해서 아래를 확인합니다.

- 제목이 `2026년 프린스 하계휴가 일정`으로 보이는지
- 팀원 선택 버튼을 누르면 팀원명이 나오는지
- 주차 선택 후 `선택 완료`를 누르면 확정 팝업이 뜨는지
- 확정하면 달력에 이름과 선이 표시되는지
- 다른 브라우저나 다른 PC에서도 같은 내용이 보이는지

## 4. 직원 사용 방법

1. 왼쪽 `팀원 휴가 선택` 영역에서 팀원명 버튼 클릭
2. 본인 이름 선택
3. 휴가 주차 선택
4. `선택 완료` 클릭
5. 팝업에서 `확정` 클릭
6. 달력에 본인 이름과 휴가 기간 선이 표시됨

## 5. 관리자 사용 방법

1. 우측 상단 `관리자 설정` 클릭
2. 비밀번호 입력

```txt
admin1234
```

3. 관리자 설정에서 아래 항목 수정 가능

- 연도
- 제목
- 휴가 시작일
- 휴가 종료일
- 휴가 체크 마감일
- 상단 메모
- 팀원 추가
- 팀원 이름 수정
- 팀원 색상 변경
- 팀원 삭제
- 휴가 선택 전체 초기화
- JSON 백업 / 복원

## 6. 주의사항

- 단순 HTML 드래그앤드롭 배포가 아니라 GitHub 연결 배포를 권장합니다.
- 이 프로젝트는 Netlify Functions와 Netlify Blobs 저장 기능을 사용합니다.
- 여러 직원이 동시에 같은 팀원을 수정하면 마지막으로 저장한 내용이 반영됩니다.
- 관리자 비밀번호 `admin1234`는 내부용 간단 보호입니다. 외부 공개 페이지라면 Netlify Identity, Supabase Auth 같은 로그인 기능을 붙이는 것이 안전합니다.

## 최근 수정 반영

- 선택 완료한 팀원 이름을 검정 배지 + 팀원 색상 테두리로 변경해 달력에서 잘 보이게 조정했습니다.
- 달력 날짜 칸 높이를 줄였고, 확정된 팀원 수 기준으로만 필요한 높이가 잡히도록 변경했습니다.
- 휴가 체크 마감일 이후에는 직원 화면에서 선택 완료와 선택 취소가 막힙니다.
- 마감일 이후 수정이나 추가 시도 시 “관리자에게 문의” 안내 팝업이 뜹니다.
- 서버 함수에서도 마감일 이후 선택/취소 요청을 차단합니다. 관리자 설정 변경과 초기화는 관리자 비밀번호로 가능합니다.

## 최신 수정 반영 사항

- 같은 주차에는 팀원 1명만 신청할 수 있습니다.
- 이미 다른 팀원이 선택한 주차를 신청하면 안내 팝업이 표시됩니다.
- 휴가 선택이 정상 완료되면 `즐거운 휴가 되세요 😎🌴` 안내 팝업이 표시됩니다.
- 중복 신청 제한은 화면뿐 아니라 Netlify Functions 서버에서도 한 번 더 검사합니다.


## 이번 버전 수정 사항

- 관리자 설정창을 열고 날짜를 수정하는 동안 4초 자동 새로고침이 입력값을 덮어쓰지 않도록 수정했습니다.
- 휴가 종료일은 9월 이후 날짜도 자유롭게 저장됩니다.
- `7월말~8월말 자동 기간 적용` 버튼을 누른 경우에만 해당 연도 기준 7월 마지막주~8월 마지막주로 다시 계산됩니다.
- 종료일을 9월로 늘린 뒤에는 반드시 `관리자 설정 저장` 버튼을 눌러 서버에 반영하세요.

## 이번 수정 반영 사항 - 휴가 기간 기준 주차 생성

- 팀원 휴가 주차 선택 목록이 관리자 설정의 `휴가 시작일`과 `휴가 종료일` 범위 안에서만 생성되도록 수정했습니다.
- 예를 들어 휴가 시작일이 `2026-07-25`이면 더 이상 `7/18~7/26` 주차가 나오지 않고, 첫 선택 주차는 `7/25~8/2`로 표시됩니다.
- 휴가 종료일도 동일하게 적용되어 설정 기간 밖의 날짜가 선택 목록에 포함되지 않습니다.


## 이번 수정: 같은 주 최대 2명 허용

- 같은 주차에는 최대 2명까지 휴가 신청이 가능합니다.
- 이미 2명이 선택한 주차를 세 번째 팀원이 선택하면 안내 팝업이 표시됩니다.
- 팀원 휴가 선택 목록에는 각 주차별 현재 신청 인원 `0/2`, `1/2`, `2/2 마감`이 표시됩니다.
- 서버 함수에서도 동일하게 최대 2명 제한을 다시 검사합니다.
## 이번 수정 내용

- 같은 주차에 2명이 신청된 경우에도 팀원 이름이 서로 겹치지 않도록 달력 표시 줄 간격을 조정했습니다.
- 팀원 이름 배지 글자 크기와 패딩을 줄이고, 1행/2행으로 안정적으로 나뉘어 보이도록 수정했습니다.
- 달력 높이는 선택 인원 전체 수가 아니라 같은 주차의 최대 신청 인원 기준으로 계산되도록 수정했습니다.

## 8. 대표 주차 제한 예외 규칙

- 일반 팀원은 같은 주차에 최대 2명까지만 신청할 수 있습니다.
- 팀원명이 `대표` 또는 `대표님`이거나 이름에 `대표`가 포함된 경우, 주차별 2명 제한에 포함하지 않습니다.
- 대표는 일반 팀원 2명이 이미 선택한 주차에도 별도로 선택·표시됩니다.
- 달력에서는 대표 배지에 `대표` 표시가 붙어 구분됩니다.
