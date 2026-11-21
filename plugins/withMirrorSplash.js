const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');
const Jimp = require('jimp-compact');

const sizes = {
  mdpi: 288,
  hdpi: 432,
  xhdpi: 576,
  xxhdpi: 864,
  xxxhdpi: 1152,
};

module.exports = function withMirrorSplash(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const root = config.modRequest.projectRoot;
      const res = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res');
      const artwork = await Jimp.read(path.join(root, 'assets', 'android-icon-foreground.png'));

      for (const [density, size] of Object.entries(sizes)) {
        const splash = new Jimp(size, size, 0x303239ff);
        const iconSize = Math.round(size * 0.83);
        const icon = artwork.clone().resize(iconSize, iconSize, Jimp.RESIZE_BICUBIC);
        splash.composite(icon, Math.floor((size - iconSize) / 2), Math.floor((size - iconSize) / 2));
        const output = path.join(res, `drawable-${density}`, 'splashscreen_logo.png');
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, await splash.getBufferAsync(Jimp.MIME_PNG));
      }

      const colorsPath = path.join(res, 'values', 'colors.xml');
      const colors = fs.readFileSync(colorsPath, 'utf8');
      const updated = colors.replace(
        /(<color name="splashscreen_background">)[^<]+(<\/color>)/,
        '$1#303239$2'
      );
      if (updated === colors) throw new Error('Could not find splashscreen_background in colors.xml');
      fs.writeFileSync(colorsPath, updated);

      return config;
    },
  ]);
};
