# 프린스 하계휴가 일정표 Netlify 배포 가이드

## 1. 프로젝트 구성

이 ZIP 파일에는 아래 파일이 들어 있습니다.

```txt
prince-vacation-netlify/
├─ index.html
├─ package.json
├─ netlify.toml
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
