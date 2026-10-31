// Renders the share images (1200x630, what a link shows on LinkedIn, X, WhatsApp...) with a local Chrome:
//   img/og.png        raunakpatil.com       from scripts/og/home-og.html
//   img/radar-og.png  /radar and /ai-tools  from scripts/og/radar-og.html
// WhatsApp shows the big card only for a PNG that stays under about 300 KB (a JPEG got the small thumbnail even at
// 100 KB). A photo can push the site's card just over that: soften only the photo very slightly, which keeps every
// colour (256-colour versions band the photo's smooth background) (Python with Pillow):
//   node scripts/build-og.mjs   (needs puppeteer-core: npx -p puppeteer-core ...)
//   python -c "from PIL import Image as I, ImageFilter as F; im=I.open('img/og.png').convert('RGB'); b=(776,80,1112,548); im.paste(im.crop(b).filter(F.GaussianBlur(0.6)), b[:2]); im.save('img/og.png', optimize=True)"
// then give its address in index.html a new ?v= (og:image), so the apps fetch it again.
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'node:url';

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const JOBS = [['home-og.html', 'og.png'], ['radar-og.html', 'radar-og.png']];
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--allow-file-access-from-files'] });
for (const [src, out] of JOBS) {
  const p = await b.newPage();
  await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await p.goto(new URL(`./og/${src}`, import.meta.url).href, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: fileURLToPath(new URL(`../img/${out}`, import.meta.url)), type: 'png' });
  await p.close();
  console.log(`img/${out} from og/${src}`);
}
await b.close();
