# 기억 서재 · Memory Library

마리나라 개인 확장 **기억 서재 v0.10.21**의 소스, 테스트 및 설치 파일입니다.

## 설치

[Memory-Library-v0.10.21.personal-extension.zip](deliverable/Memory-Library-v0.10.21.personal-extension.zip)을 내려받아 마리나라의 개인 확장 가져오기에서 설치해 주세요.

- [사용 안내](memory-src/README.md)
- [변경 이력](memory-src/RELEASE-NOTES.md)

## 소스와 빌드

`memory-src/`에 구현과 테스트가 있으며, `deliverable/`에 설치용 ZIP과 빌드 파일이 있습니다.

```sh
python3 memory-src/build.py
```

Node.js와 Python 3가 필요합니다. DOM 테스트에는 `linkedom`이 필요합니다.

```sh
npm install --no-save --package-lock=false linkedom
node --test memory-src/core.test.cjs memory-src/runtime.test.cjs memory-src/dom.test.cjs
```

브라우저 테스트는 별도로 Playwright와 Chromium이 필요합니다.

## 검증 범위

v0.10.21의 기존 자동화 검증 기록은 전체 392개 통과, 이전 버전 회귀 테스트 387개 통과입니다. 업로드 전 ZIP 압축 해제, 필수 파일, 소스와 번들 일치 및 manifest 호환성을 재확인했습니다. 실제 서버·모델 연동 및 모바일 실기기 검증은 완료하지 않았습니다.

기존 설정과 저장 데이터의 호환성을 유지하며, 기본 요약·LTM 설정을 자동으로 변경하지 않습니다. 상세한 기능과 제약은 사용 안내를 확인해 주세요.
