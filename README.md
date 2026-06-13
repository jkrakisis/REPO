# ICH.COURIER Design System Tokens

Figma `Project ICH.COURIER 2604 new`에서 추출한 디자인 시스템 토큰과, 해당 토큰을 적용한 정적 HTML/CSS 프로토타입을 관리하는 저장소입니다.

- GitHub repository: [jkrakisis/REPO](https://github.com/jkrakisis/REPO)
- GitHub Pages: [https://jkrakisis.github.io/REPO/prototype/](https://jkrakisis.github.io/REPO/prototype/)

> GitHub Pages URL은 repository Settings > Pages에서 `main` branch / root 배포가 활성화된 뒤 확인할 수 있습니다.

## Project Structure

```text
.
├─ tokens.json          # Figma 기준 디자인 토큰 원본
├─ sd.config.js         # Style Dictionary 빌드 설정
├─ tokens.css           # CSS custom properties 출력 파일
├─ tokens.scss          # SCSS 변수 및 토큰 출력 파일
├─ package.json         # token build scripts
└─ prototype/
   ├─ index.html        # 토큰 기반 HTML 프로토타입
   ├─ styles.css        # 프로토타입 스타일
   └─ assets/           # 프로토타입용 에셋 폴더
```

## Setup

```bash
npm install
```

`node_modules/`는 Git에 포함하지 않습니다.

## Build Tokens

```bash
npm run build-tokens
```

개발 중 토큰 변경을 감시하려면 아래 명령을 사용할 수 있습니다.

```bash
npm run watch-tokens
```

빌드 결과로 `tokens.css`, `tokens.scss`가 생성됩니다.

## Token Files

### `tokens.json`

Figma 변수 기준으로 정리한 토큰 원본입니다. 색상, 타이포그래피, 간격, radius, component size, semantic color 등의 값을 포함합니다.

### `tokens.css`

웹 구현에서 바로 사용할 수 있는 CSS custom properties 파일입니다.

```html
<link rel="stylesheet" href="./tokens.css">
```

```css
.article-title {
  color: var(--color\/text\/basic);
  font-size: var(--title-large);
  line-height: var(--line-height-150);
}
```

Figma 변수명에 `/`가 포함된 경우 CSS 변수에서는 escape 형태로 사용합니다.

```css
var(--color\/background\/bg-color07)
var(--color\/text\/basic)
```

### `tokens.scss`

SCSS 환경에서 사용할 수 있는 토큰 출력 파일입니다.

## Prototype

프로토타입은 `prototype/index.html`에서 확인할 수 있습니다.

로컬에서 바로 열기:

```text
D:\design_workflow\token\prototype\index.html
```

프로토타입 스타일은 `prototype/styles.css`에 있으며, 상위의 `tokens.css`를 불러와 디자인 시스템 토큰을 사용합니다.

```html
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="./styles.css">
```

현재 프로토타입은 Figma 화면의 레이아웃, 헤더, 태그, 관련글 영역을 기준으로 구현되어 있습니다. 이미지 영역은 캡처 이미지를 사용하지 않고 회색 placeholder 영역으로 표시합니다.

## GitHub Pages Deployment

1. GitHub repository로 이동합니다.
2. `Settings` > `Pages`를 엽니다.
3. `Build and deployment`에서 `Deploy from a branch`를 선택합니다.
4. Branch는 `main`, folder는 `/root`로 설정합니다.
5. 저장 후 배포가 완료되면 아래 주소에서 확인합니다.

```text
https://jkrakisis.github.io/REPO/prototype/
```

## Git Workflow

```bash
git status
git add .
git commit -m "Update design tokens"
git push
```

토큰을 수정할 때는 아래 순서를 권장합니다.

1. Figma 기준으로 `tokens.json`을 수정합니다.
2. `npm run build-tokens`로 `tokens.css`, `tokens.scss`를 재생성합니다.
3. 프로토타입 화면을 확인합니다.
4. 변경사항을 commit/push 합니다.

## Notes

- `tokens.css`, `tokens.scss`는 생성 파일이므로 직접 수정하기보다 `tokens.json` 또는 `sd.config.js`를 수정한 뒤 다시 빌드하는 것을 권장합니다.
- `prototype/desktop.png`, `prototype/mobile.png`는 로컬 화면 검수용 캡처 파일이며 Git에는 포함하지 않습니다.
- Style Dictionary 빌드 중 토큰 이름 충돌 경고가 표시될 수 있습니다. 현재 설정은 Figma alias를 포함한 custom formatter 출력 기준으로 관리합니다.

