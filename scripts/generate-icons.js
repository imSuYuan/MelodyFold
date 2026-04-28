import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, '..', 'src-tauri', 'icons', 'logo.svg');
const iconsDir = join(__dirname, '..', 'src-tauri', 'icons');

const svgBuffer = readFileSync(svgPath);

const pngSizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
];

async function generateIcons() {
  console.log('Generating icons from SVG...');

  // Generate all PNGs
  for (const { name, size } of pngSizes) {
    const outputPath = join(iconsDir, name);
    await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }

  // Generate proper ICO for Windows (multi-size)
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngBuffers = [];
  for (const size of icoSizes) {
    const buf = await sharp(svgBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    icoPngBuffers.push(buf);
  }

  const icoPath = join(iconsDir, 'icon.ico');
  const icoBuffer = await pngToIco(icoPngBuffers);
  writeFileSync(icoPath, icoBuffer);
  console.log(`  ✓ icon.ico (multi-size: ${icoSizes.join(', ')}px)`);

  // Generate ICNS for macOS (using 512x512 PNG as base)
  const icnsPath = join(iconsDir, 'icon.icns');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(icnsPath);
  console.log(`  ✓ icon.icns (512x512)`);

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
