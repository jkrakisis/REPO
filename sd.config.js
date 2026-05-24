/**
 * Style Dictionary v4 — ICH.COURIER Design Token Build Config
 *
 * tokens.json 의 커스텀 멀티모드 $value 구조를 그대로 처리하기 위해
 * 커스텀 포매터가 raw JSON을 직접 읽어 CSS / SCSS 를 생성합니다.
 *
 * Usage:
 *   npm run build-tokens          → CSS + SCSS 모두 빌드
 */

import StyleDictionary from 'style-dictionary';
import { readFileSync }  from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath }    from 'url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const RAW_TOKENS = JSON.parse(readFileSync(resolve(__dirname, 'tokens.json'), 'utf-8'));

// ─────────────────────────────────────────────────────────────────
//  공통 유틸
// ─────────────────────────────────────────────────────────────────

/** {color.primary.60} → var(--color-primary-60) */
function refToVar(v) {
  if (typeof v !== 'string') return String(v);
  return v.replace(/\{([^}]+)\}/g, (_, p) => `var(--${p.replace(/\./g, '-')})`);
}

/** $value 가 멀티모드 객체인지 확인 */
function isModeObj(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function detectModeType(v) {
  if (!isModeObj(v)) return null;
  const k = Object.keys(v);
  if (k.includes('desktop')) return 'breakpoint';
  if (k.includes('md'))      return 'radius';
  if (k.includes('light'))   return 'theme';
  return null;
}

/** 토큰 트리를 순회해 리프 토큰 배열 반환 */
function collectTokens(obj, path = []) {
  const result = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (val && typeof val === 'object' && '$value' in val) {
      result.push({ path: [...path, key], val });
    } else if (val && typeof val === 'object') {
      result.push(...collectTokens(val, [...path, key]));
    }
  }
  return result;
}

/** path 배열 → CSS 커스텀 프로퍼티 이름 */
function cssVar(path) { return '--' + path.join('-'); }

/** 단일 CSS 선언 라인 (패딩 포함) */
function decl(name, value, pad = 0) {
  return `  ${name.padEnd(pad)}: ${value};\n`;
}

/** Figma variable names that contain "/" must be escaped in CSS. */
function figmaVar(name) {
  return `--${name.replace(/\//g, '\\/')}`;
}

function figmaDecl(name, value, pad = 0) {
  return decl(figmaVar(name), value, pad);
}

function renderFigmaStaticAliases(indent = '  ') {
  const aliases = [
    ['key-font01', 'var(--font-family-01)'],
    ['key-font02', 'var(--font-family-02)'],
    ['key-font03', 'var(--font-family-03)'],
    ['title-xxlarge', 'var(--font-size-title2)'],
    ['title-xlarge', 'var(--font-size-title3)'],
    ['title-large', 'var(--font-size-title3)'],
    ['title-medium', 'var(--font-size-heading1)'],
    ['title-small', 'var(--font-size-heading3)'],
    ['title-xxsmall', 'var(--font-size-heading4)'],
    ['link-large', 'var(--font-size-body2)'],
    ['link-small', 'var(--font-size-label1)'],
    ['link-xsmall', 'var(--font-size-caption1)'],
    ['label-xsmall', 'var(--font-size-label2)'],
    ['line-height/line-height-18', 'var(--line-height-18)'],
    ['line-height/line-height-20', 'var(--line-height-20)'],
    ['line-height/line-height-22', 'var(--line-height-22)'],
    ['line-height/line-height-24', 'var(--line-height-24)'],
    ['line-height/line-height-26', 'var(--line-height-26)'],
    ['line-height/line-height-28', 'var(--line-height-28)'],
    ['line-height/line-height-30', 'var(--line-height-30)'],
    ['line-height/line-height-32', 'var(--line-height-32)'],
    ['line-height/line-height-34', 'var(--line-height-34)'],
    ['line-height/line-height-36', 'var(--line-height-36)'],
    ['line-height/line-height-38', 'var(--line-height-38)'],
    ['line-height/line-height-40', 'var(--line-height-40)'],
    ['line-height/line-height-44', 'var(--line-height-44)'],
    ['line-height/line-height-48', 'var(--line-height-48)'],
    ['line-height/line-height-56', 'var(--line-height-56)'],
    ['line-height/line-height-64', 'var(--line-height-64)'],
    ['resolution/layout-gap', '320px'],
    ['resolution/layout-gap2', '360px'],
    ['resolution/layout-gap3', '460px'],
  ];

  const maxLen = Math.max(...aliases.map(([name]) => figmaVar(name).length));
  return aliases.map(([name, value]) => indent + figmaDecl(name, value, maxLen).trimStart()).join('');
}

function renderFigmaColorAliases(themeKey, indent = '  ') {
  const light = themeKey === 'light';
  const aliases = [
    ['color/key/primary', 'var(--color-key-primary)'],
    ['color/key/secondary', 'var(--color-key-secondary)'],
    ['color/key/sub-color01', 'var(--color-key-sub-color01)'],
    ['color/key/accent01', 'var(--color-key-accent01)'],
    ['color/key/accent02', 'var(--color-key-accent02)'],
    ['color/background/bg-color01', 'var(--color-bg-01)'],
    ['color/background/bg-color02', 'var(--color-bg-02)'],
    ['color/background/bg-color03', 'var(--color-bg-03)'],
    ['color/background/bg-color04', 'var(--color-bg-04)'],
    ['color/background/bg-color05', 'var(--color-bg-05)'],
    ['color/background/bg-color06', 'var(--color-bg-06)'],
    ['color/background/bg-color07', 'var(--color-bg-07)'],
    ['color/background/bg-color08', 'var(--color-bg-08)'],
    ['color/gray/white', 'var(--color-gray-white)'],
    ['color/gray/black', 'var(--color-gray-black)'],
    ['color/gray/gray-1', 'var(--color-gray-1)'],
    ['color/gray/gray-2', 'var(--color-gray-2)'],
    ['color/gray/gray-3', 'var(--color-gray-3)'],
    ['color/gray/gray-4', 'var(--color-gray-4)'],
    ['color/gray/gray-5', 'var(--color-gray-5)'],
    ['color/gray/gray-6', 'var(--color-gray-6)'],
    ['color/gray/gray-7', 'var(--color-gray-7)'],
    ['color/gray/gray-8', 'var(--color-gray-8)'],
    ['color/gray/gray-9', 'var(--color-gray-9)'],
    ['color/gray/gray-10', 'var(--color-gray-10)'],
    ['color/text/basic', light ? '#151515' : '#f4f5f6'],
    ['color/text/primary', light ? '#0d3a65' : '#cdd1d5'],
    ['color/text/subtle', light ? 'var(--color-gray-4)' : 'var(--color-gray-7)'],
    ['color/text/bpoint-blue', '#0b50d0'],
    ['color/text/warning', 'var(--color-warning-60)'],
    ['color/line/line-color01', light ? '#dddddd' : '#464c53'],
    ['color/line/line-color09', light ? '#0e0e0e' : '#f4f5f6'],
    ['color/light/alpha/white75', 'var(--color-alpha-white-75)'],
  ];

  const maxLen = Math.max(...aliases.map(([name]) => figmaVar(name).length));
  return aliases.map(([name, value]) => indent + figmaDecl(name, value, maxLen).trimStart()).join('');
}

// ─────────────────────────────────────────────────────────────────
//  CSS 포매터 헬퍼: 섹션별 선언 블록 생성
// ─────────────────────────────────────────────────────────────────

function renderBlock(selector, lines) {
  if (!lines.length) return '';
  return `${selector} {\n${lines.join('')}}\n`;
}

function renderSection(title, block) {
  const bar = '='.repeat(60);
  return `/* ${bar}\n   ${title}\n   ${bar} */\n${block}\n`;
}

// ─────────────────────────────────────────────────────────────────
//  CSS 포매터
// ─────────────────────────────────────────────────────────────────

function generateCSS(raw) {
  const header =
    `/* ${'='.repeat(60)}\n` +
    `   ICH.COURIER Design System Tokens\n` +
    `   Generated from: tokens.json  |  DO NOT EDIT MANUALLY\n` +
    `   Run: npm run build-tokens\n` +
    `   ${'='.repeat(60)} */\n\n`;

  let out = header;

  // ── 1. Font 프리미티브 (:root) ──────────────────────────────
  const FONT_CATS = ['font-family', 'font-weight', 'line-height', 'letter-spacing'];
  const fontLines = [];
  for (const cat of FONT_CATS) {
    if (!raw[cat]) continue;
    fontLines.push(`\n  /* ${cat.replace(/-/g, ' ').toUpperCase()} */\n`);
    const entries = collectTokens(raw[cat], [cat]);
    const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));
    for (const { path, val } of entries) {
      const v = val.$type === 'fontFamily'
        ? `'${val.$value}', sans-serif`
        : refToVar(String(val.$value));
      fontLines.push(decl(cssVar(path), v, maxLen));
    }
  }
  out += renderSection('PRIMITIVE — Font', renderBlock(':root', fontLines));

  // ── 2. 색상 팔레트 (:root) ──────────────────────────────────
  if (raw.color) {
    const colorLines = [];
    for (const [group, tokens] of Object.entries(raw.color)) {
      if (group.startsWith('$')) continue;
      colorLines.push(`\n  /* ${group} */\n`);
      const entries = collectTokens(tokens, ['color', group]);
      const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));
      for (const { path, val } of entries) {
        colorLines.push(decl(cssVar(path), String(val.$value), maxLen));
      }
    }
    out += renderSection('PRIMITIVE — Color Palette', renderBlock(':root', colorLines));
  }

  // ── 3. Border Radius (md default + data-attribute 모드) ─────
  if (raw['border-radius']) {
    const entries = collectTokens(raw['border-radius'], ['border-radius']);
    const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));

    for (const [modeKey, selector] of [
      ['md',   ':root'],
      ['sm',   '[data-radius="sm"]'],
      ['none', '[data-radius="none"]'],
    ]) {
      const lines = entries.map(({ path, val }) =>
        decl(cssVar(path), String(val.$value[modeKey] ?? val.$value), maxLen)
      );
      const title = modeKey === 'md'
        ? 'BORDER RADIUS — mode: md (default)'
        : `BORDER RADIUS — mode: ${modeKey}`;
      out += renderSection(title, renderBlock(selector, lines));
    }
  }

  // ── 4. Spacing / Font Size / Button Size (반응형) ───────────
  const RESPONSIVE_CATS = [
    { key: 'spacing',     title: 'SPACING' },
    { key: 'font-size',   title: 'FONT SIZE' },
    { key: 'button-size', title: 'BUTTON SIZE' },
    { key: 'padding-card',title: 'CARD PADDING' },
  ];

  const bpSections = { desktop: [], tablet: [], mobile: [] };

  for (const { key, title } of RESPONSIVE_CATS) {
    if (!raw[key]) continue;
    const entries = collectTokens(raw[key], [key]);
    const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));

    // desktop default
    bpSections.desktop.push(`\n  /* ${title} — Desktop */\n`);
    for (const { path, val } of entries) {
      const v = isModeObj(val.$value) ? val.$value.desktop : val.$value;
      bpSections.desktop.push(decl(cssVar(path), refToVar(String(v)), maxLen));
    }

    // tablet overrides (skip when same as desktop)
    const tabletChanged = entries.filter(({ val }) => {
      if (!isModeObj(val.$value)) return false;
      return val.$value.tablet !== val.$value.desktop;
    });
    if (tabletChanged.length) {
      const tMaxLen = Math.max(...tabletChanged.map(e => cssVar(e.path).length));
      bpSections.tablet.push(`\n    /* ${title} */\n`);
      for (const { path, val } of tabletChanged) {
        bpSections.tablet.push('  ' + decl(cssVar(path), String(val.$value.tablet), tMaxLen));
      }
    }

    // mobile overrides (skip when same as desktop)
    const mobileChanged = entries.filter(({ val }) => {
      if (!isModeObj(val.$value)) return false;
      return val.$value.mobile !== val.$value.desktop;
    });
    if (mobileChanged.length) {
      const mMaxLen = Math.max(...mobileChanged.map(e => cssVar(e.path).length));
      bpSections.mobile.push(`\n    /* ${title} */\n`);
      for (const { path, val } of mobileChanged) {
        bpSections.mobile.push('  ' + decl(cssVar(path), String(val.$value.mobile), mMaxLen));
      }
    }
  }

  out += renderSection('RESPONSIVE DEFAULTS — Desktop', renderBlock(':root', bpSections.desktop));

  out += renderSection(
    'FIGMA VARIABLE ALIASES — Static',
    renderBlock(':root', [`\n  /* Figma typography, font, line-height, and layout aliases */\n`, renderFigmaStaticAliases()])
  );

  if (bpSections.tablet.length) {
    const inner = `  :root {\n${bpSections.tablet.join('')}  }\n`;
    out += renderSection('RESPONSIVE — Tablet (768px)', `@media (max-width: 1199px) {\n${inner}}\n`);
  }
  if (bpSections.mobile.length) {
    const inner = `  :root {\n${bpSections.mobile.join('')}  }\n`;
    out += renderSection('RESPONSIVE — Mobile (375px)', `@media (max-width: 767px) {\n${inner}}\n`);
  }

  // ── 5. 시멘틱 컬러 (light / dark) ───────────────────────────
  if (raw.semantic?.color) {
    for (const [themeKey, selector] of [
      ['light', ':root,\n[data-theme="light"]'],
      ['dark',  '[data-theme="dark"]'],
    ]) {
      const lines = [];
      for (const [group, tokens] of Object.entries(raw.semantic.color)) {
        if (group.startsWith('$')) continue;
        lines.push(`\n  /* ${group} */\n`);
        const pathBase = group === 'background' ? ['color'] : ['color', group];
        const entries = collectTokens(tokens, pathBase);
        const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));
        for (const { path, val } of entries) {
          const v = isModeObj(val.$value) ? val.$value[themeKey] : val.$value;
          lines.push(decl(cssVar(path), refToVar(String(v ?? '')), maxLen));
        }
      }
      lines.push(`\n  /* Figma color aliases */\n`);
      lines.push(renderFigmaColorAliases(themeKey));
      const title = themeKey === 'light'
        ? 'SEMANTIC COLOR — Light Mode (default)'
        : 'SEMANTIC COLOR — Dark Mode';
      out += renderSection(title, renderBlock(selector, lines));
    }
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────
//  SCSS 포매터 헬퍼
// ─────────────────────────────────────────────────────────────────

function scssVar(path) { return '$' + path.join('-'); }

function scssDecl(name, value, pad = 0) {
  return `${name.padEnd(pad)}: ${value};\n`;
}

function scssSection(title) {
  const bar = '='.repeat(60);
  return `\n// ${bar}\n// ${title}\n// ${bar}\n\n`;
}

// ─────────────────────────────────────────────────────────────────
//  SCSS 포매터
// ─────────────────────────────────────────────────────────────────

function generateSCSS(raw) {
  let out =
    `// ${'='.repeat(60)}\n` +
    `// ICH.COURIER Design System — Tokens (SCSS)\n` +
    `// Source: tokens.json  |  DO NOT EDIT MANUALLY\n` +
    `// Run: npm run build-tokens\n` +
    `// ${'='.repeat(60)}\n`;

  // ── 브레이크포인트 변수 + 믹스인 (정적) ──────────────────────
  out += scssSection('BREAKPOINTS');
  out += `$bp-tablet: 1199px;\n$bp-mobile: 767px;\n\n`;
  out += `@mixin tablet { @media (max-width: $bp-tablet) { @content; } }\n`;
  out += `@mixin mobile  { @media (max-width: $bp-mobile)  { @content; } }\n`;

  // ── flat 프리미티브 SCSS 변수 ─────────────────────────────────
  const FONT_CATS = ['font-family', 'font-weight', 'line-height', 'letter-spacing'];
  for (const cat of FONT_CATS) {
    if (!raw[cat]) continue;
    const label = cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    out += scssSection(`PRIMITIVE — ${label}`);
    const entries = collectTokens(raw[cat], [cat]);
    const maxLen  = Math.max(...entries.map(e => scssVar(e.path).length));
    for (const { path, val } of entries) {
      const v = typeof val.$value === 'string' && val.$value.toLowerCase().includes('pretendard')
        ? `'Pretendard', sans-serif`
        : typeof val.$value === 'string' && val.$value.toLowerCase().includes('montserrat')
          ? `'Montserrat', sans-serif`
          : String(val.$value);
      out += scssDecl(scssVar(path), v, maxLen);
    }
  }

  // ── 색상 SCSS 변수 ────────────────────────────────────────────
  if (raw.color) {
    out += scssSection('PRIMITIVE — Color Palette');
    for (const [group, tokens] of Object.entries(raw.color)) {
      if (group.startsWith('$')) continue;
      out += `// ${group}\n`;
      const entries = collectTokens(tokens, ['color', group]);
      const maxLen  = Math.max(...entries.map(e => scssVar(e.path).length));
      for (const { path, val } of entries) {
        out += scssDecl(scssVar(path), String(val.$value), maxLen);
      }
      out += '\n';
    }
  }

  // ── 멀티모드 SCSS Map ─────────────────────────────────────────
  const MAP_CATS = [
    { key: 'border-radius', label: 'Border Radius (3 modes: md, sm, none)' },
    { key: 'spacing',       label: 'Spacing (desktop / tablet / mobile)' },
    { key: 'font-size',     label: 'Font Size (desktop / tablet / mobile)' },
    { key: 'button-size',   label: 'Button Size (desktop / tablet / mobile)' },
    { key: 'padding-card',  label: 'Card Padding (desktop / tablet / mobile)' },
  ];
  out += scssSection('SCSS MAPS — Multi-mode Tokens');
  for (const { key, label } of MAP_CATS) {
    if (!raw[key]) continue;
    out += `// ${label}\n`;
    out += `$${key}: (\n`;
    for (const [name, val] of Object.entries(raw[key])) {
      if (name.startsWith('$')) continue;
      if (isModeObj(val.$value)) {
        const inner = Object.entries(val.$value)
          .map(([m, v]) => `"${m}": ${v}`)
          .join(', ');
        out += `  "${name}": (${inner}),\n`;
      } else {
        out += `  "${name}": ${val.$value},\n`;
      }
    }
    out += `);\n\n`;
  }

  // ── CSS 커스텀 프로퍼티 (:root 통합 블록) ─────────────────────
  out += scssSection('CSS CUSTOM PROPERTIES — :root');
  out += `:root {\n`;

  // font
  for (const cat of FONT_CATS) {
    if (!raw[cat]) continue;
    const entries = collectTokens(raw[cat], [cat]);
    out += `\n  // ${cat}\n`;
    const maxLen = Math.max(...entries.map(e => cssVar(e.path).length));
    for (const { path, val } of entries) {
      const sv = scssVar(path);
      out += `  ${cssVar(path).padEnd(maxLen)}: #{${sv}};\n`;
    }
  }

  // color
  if (raw.color) {
    for (const [group, tokens] of Object.entries(raw.color)) {
      if (group.startsWith('$')) continue;
      out += `\n  // ${group}\n`;
      const entries = collectTokens(tokens, ['color', group]);
      const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));
      for (const { path, val } of entries) {
        out += `  ${cssVar(path).padEnd(maxLen)}: #{${scssVar(path)}};\n`;
      }
    }
  }

  // border-radius default (md)
  if (raw['border-radius']) {
    const entries = collectTokens(raw['border-radius'], ['border-radius']);
    out += `\n  // Border Radius (md = default)\n`;
    const maxLen = Math.max(...entries.map(e => cssVar(e.path).length));
    for (const { path, val } of entries) {
      out += `  ${cssVar(path).padEnd(maxLen)}: ${val.$value.md ?? val.$value};\n`;
    }
  }

  // responsive desktop defaults
  const RESP_CATS = ['spacing', 'font-size', 'button-size', 'padding-card'];
  for (const cat of RESP_CATS) {
    if (!raw[cat]) continue;
    const entries = collectTokens(raw[cat], [cat]);
    out += `\n  // ${cat} (desktop)\n`;
    const maxLen = Math.max(...entries.map(e => cssVar(e.path).length));
    for (const { path, val } of entries) {
      const v = isModeObj(val.$value) ? val.$value.desktop : val.$value;
      out += `  ${cssVar(path).padEnd(maxLen)}: ${v};\n`;
    }
  }

  out += `\n  // Figma typography, font, line-height, and layout aliases\n`;
  out += renderFigmaStaticAliases();

  out += `}\n`;

  // ── 반경 모드 ─────────────────────────────────────────────────
  if (raw['border-radius']) {
    out += scssSection('BORDER RADIUS MODES');
    const entries = collectTokens(raw['border-radius'], ['border-radius']);
    const maxLen  = Math.max(...entries.map(e => cssVar(e.path).length));
    for (const [modeKey, selector] of [['sm', '[data-radius="sm"]'], ['none', '[data-radius="none"]']]) {
      out += `${selector} {\n`;
      for (const { path, val } of entries) {
        out += `  ${cssVar(path).padEnd(maxLen)}: ${val.$value[modeKey] ?? val.$value};\n`;
      }
      out += `}\n\n`;
    }
  }

  // ── 반응형 믹스인 블록 ─────────────────────────────────────────
  for (const [bpKey, bpLabel] of [['tablet', 'Tablet (≤1199px)'], ['mobile', 'Mobile (≤767px)']]) {
    const bpLines = [];
    for (const cat of RESP_CATS) {
      if (!raw[cat]) continue;
      const entries = collectTokens(raw[cat], [cat]);
      const changed = entries.filter(({ val }) =>
        isModeObj(val.$value) && val.$value[bpKey] !== val.$value.desktop
      );
      if (!changed.length) continue;
      const maxLen = Math.max(...changed.map(e => cssVar(e.path).length));
      bpLines.push(`\n    // ${cat}\n`);
      for (const { path, val } of changed) {
        bpLines.push(`    ${cssVar(path).padEnd(maxLen)}: ${val.$value[bpKey]};\n`);
      }
    }
    if (bpLines.length) {
      out += scssSection(`RESPONSIVE — ${bpLabel}`);
      out += `@include ${bpKey === 'tablet' ? 'tablet' : 'mobile'} {\n  :root {${bpLines.join('')}  }\n}\n`;
    }
  }

  // ── 시멘틱 컬러 ───────────────────────────────────────────────
  if (raw.semantic?.color) {
    out += scssSection('SEMANTIC COLOR — Light Mode (default)');
    out += `:root,\n[data-theme="light"] {\n`;
    for (const [group, tokens] of Object.entries(raw.semantic.color)) {
      if (group.startsWith('$')) continue;
      const pathBase = group === 'background' ? ['color'] : ['color', group];
      const entries = collectTokens(tokens, pathBase);
      out += `\n  // ${group}\n`;
      const maxLen = Math.max(...entries.map(e => cssVar(e.path).length));
      for (const { path, val } of entries) {
        const v = isModeObj(val.$value) ? val.$value.light : val.$value;
        out += `  ${cssVar(path).padEnd(maxLen)}: ${refToVar(String(v ?? ''))};\n`;
      }
    }
    out += `\n  // Figma color aliases\n`;
    out += renderFigmaColorAliases('light');
    out += `}\n`;

    out += scssSection('SEMANTIC COLOR — Dark Mode');
    out += `[data-theme="dark"] {\n`;
    for (const [group, tokens] of Object.entries(raw.semantic.color)) {
      if (group.startsWith('$')) continue;
      const pathBase = group === 'background' ? ['color'] : ['color', group];
      const entries = collectTokens(tokens, pathBase);
      out += `\n  // ${group}\n`;
      const maxLen = Math.max(...entries.map(e => cssVar(e.path).length));
      for (const { path, val } of entries) {
        const v = isModeObj(val.$value) ? val.$value.dark : val.$value;
        out += `  ${cssVar(path).padEnd(maxLen)}: ${refToVar(String(v ?? ''))};\n`;
      }
    }
    out += `\n  // Figma color aliases\n`;
    out += renderFigmaColorAliases('dark');
    out += `}\n`;
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────
//  SD 포매터 등록
// ─────────────────────────────────────────────────────────────────

StyleDictionary.registerFormat({
  name: 'css/ich-courier',
  format: () => generateCSS(RAW_TOKENS),
});

StyleDictionary.registerFormat({
  name: 'scss/ich-courier',
  format: () => generateSCSS(RAW_TOKENS),
});

// ─────────────────────────────────────────────────────────────────
//  Style Dictionary 설정
// ─────────────────────────────────────────────────────────────────

export default {
  source: ['tokens.json'],

  preprocessors: [],   // raw 포매터가 직접 처리하므로 불필요

  platforms: {
    css: {
      buildPath: '',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/ich-courier',
        },
      ],
    },
    scss: {
      buildPath: '',
      files: [
        {
          destination: 'tokens.scss',
          format: 'scss/ich-courier',
        },
      ],
    },
  },
};
