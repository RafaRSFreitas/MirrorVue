// Rebuild the Expo icon assets from the supplied, unmodified artwork.
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp-compact');
const { PNG } = require('pngjs');

const assets = path.resolve(__dirname, '..', 'assets');
const sourcePath = path.join(assets, 'icon-source.png');

function roundedRectangleAlpha(x, y) {
  // Follow the outside of the mirror, including its soft shadow.
  const left = 132;
  const top = 66;
  const right = 1122;
  const bottom = 1170;
  const radius = 245;
  const feather = 26;
  const cx = Math.max(left + radius, Math.min(x, right - radius));
  const cy = Math.max(top + radius, Math.min(y, bottom - radius));
  const distance = Math.hypot(x - cx, y - cy) - radius;
  return Math.max(0, Math.min(1, (feather / 2 - distance) / feather));
}

function makeBackground() {
  const png = new PNG({ width: 512, height: 512 });
  const top = [51, 54, 60];
  const bottom = [35, 38, 43];
  for (let y = 0; y < 512; y++) {
    const t = y / 511;
    for (let x = 0; x < 512; x++) {
      const i = (y * 512 + x) * 4;
      for (let c = 0; c < 3; c++) {
        png.data[i + c] = Math.round(top[c] * (1 - t) + bottom[c] * t);
      }
      png.data[i + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(assets, 'android-icon-background.png'), PNG.sync.write(png));
}

async function writePng(image, name) {
  fs.writeFileSync(path.join(assets, name), await image.getBufferAsync(Jimp.MIME_PNG));
}

async function main() {
  const original = await Jimp.read(sourcePath);
  if (original.bitmap.width !== 1254 || original.bitmap.height !== 1254) {
    throw new Error('Expected the original 1254 x 1254 icon artwork');
  }

  // Full-colour app icon and splash image retain the exact source composition.
  await writePng(original.clone().resize(1024, 1024, Jimp.RESIZE_BICUBIC), 'icon.png');
  await writePng(original.clone().resize(1024, 1024, Jimp.RESIZE_BICUBIC), 'splash-icon.png');
  await writePng(
    original.clone().crop(100, 80, 1054, 1054).resize(64, 64, Jimp.RESIZE_BICUBIC),
    'favicon.png'
  );

  const cutout = original.clone();
  cutout.scanQuiet(0, 0, 1254, 1254, (x, y, i) => {
    cutout.bitmap.data[i + 3] = Math.round(
      cutout.bitmap.data[i + 3] * roundedRectangleAlpha(x, y)
    );
  });

  const foreground = new Jimp(512, 512, 0x00000000);
  foreground.composite(cutout.clone().resize(390, 390, Jimp.RESIZE_BICUBIC), 61, 61);
  await writePng(foreground, 'android-icon-foreground.png');

  const monochromeCutout = cutout.clone();
  monochromeCutout.scanQuiet(0, 0, 1254, 1254, (_x, _y, i) => {
    const data = monochromeCutout.bitmap.data;
    const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    data[i + 3] = Math.round(data[i + 3] * (0.18 + 0.82 * Math.pow(luminance, 0.85)));
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  });
  const monochrome = new Jimp(432, 432, 0x00000000);
  monochrome.composite(monochromeCutout.resize(330, 330, Jimp.RESIZE_BICUBIC), 51, 51);
  await writePng(monochrome, 'android-icon-monochrome.png');

  makeBackground();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
