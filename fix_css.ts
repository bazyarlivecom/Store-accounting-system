import fs from 'fs';

let css = fs.readFileSync('src/index.css', 'utf8');

// replace theme fonts
css = css.replace(
  '--font-sans: "IRANYekanXFaNum", var(--app-font, "Vazirmatn"), ui-sans-serif, system-ui, sans-serif;',
  '--font-sans: "IRANYekanXFaNum", "Vazirmatn", ui-sans-serif, system-ui, sans-serif;'
);
css = css.replace(
  '--font-mono: "IRANYekanXFaNum", var(--app-font, "Vazirmatn"), ui-monospace, SFMono-Regular, monospace;',
  '--font-mono: "IRANYekanXFaNum", "Vazirmatn", ui-monospace, SFMono-Regular, monospace;'
);

css = css.replace(
  'font-family: "IRANYekanXFaNum", var(--app-font, "Vazirmatn"), sans-serif;',
  'font-family: "IRANYekanXFaNum", "Vazirmatn", sans-serif;'
);

// We will also rebuild the @font-face rules completely.
css = css.replace(/@font-face\s*\{[^}]+\}\s*/g, '');

const fontFaces = `
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Thin.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 200;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-UltraLight.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Light.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Regular.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Medium.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-DemiBold.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Bold.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-ExtraBold.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-Black.woff2') format('woff2');
}
@font-face {
  font-family: 'IRANYekanXFaNum';
  font-style: normal;
  font-weight: 950;
  font-display: swap;
  src: url('/Webfonts/Woff2/IRANYekanXFaNum-ExtraBlack.woff2') format('woff2');
}
`;

// Insert after @import "tailwindcss"
css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + fontFaces);

fs.writeFileSync('src/index.css', css);
console.log('Done CSS');
