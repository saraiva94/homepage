const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const OUTPUT_DIR = path.resolve(__dirname, '../src/assets/optimized');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function formatSize(bytes) {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function optimizeImage(inputPath, outputName, options = {}) {
  const { maxWidth = 1920, quality = 80 } = options;

  if (!fs.existsSync(inputPath)) {
    console.log(`  SKIP: ${inputPath} not found`);
    return;
  }

  const originalSize = fs.statSync(inputPath).size;

  // WebP (best compression)
  const outputWebp = path.join(OUTPUT_DIR, `${outputName}.webp`);
  await sharp(inputPath)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputWebp);
  const webpSize = fs.statSync(outputWebp).size;

  // JPG/PNG fallback (progressive)
  const ext = path.extname(inputPath).toLowerCase();
  const fallbackPath = path.join(OUTPUT_DIR, `${outputName}${ext === '.png' ? '.png' : '.jpg'}`);
  if (ext === '.png') {
    await sharp(inputPath)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .png({ quality, compressionLevel: 9 })
      .toFile(fallbackPath);
  } else {
    await sharp(inputPath)
      .resize(maxWidth, null, { withoutEnlargement: true })
      .jpeg({ quality, progressive: true })
      .toFile(fallbackPath);
  }
  const fallbackSize = fs.statSync(fallbackPath).size;

  const saving = ((1 - webpSize / originalSize) * 100).toFixed(0);

  console.log(`${outputName}:`);
  console.log(`  Original:  ${formatSize(originalSize)}`);
  console.log(`  WebP:      ${formatSize(webpSize)} (-${saving}%)`);
  console.log(`  Fallback:  ${formatSize(fallbackSize)}`);
}

async function main() {
  console.log('Optimizing images...\n');

  await optimizeImage(
    path.join(ASSETS_DIR, 'background.jpg'),
    'background',
    { maxWidth: 1920, quality: 75 }
  );

  await optimizeImage(
    path.join(ASSETS_DIR, 'homepage-bg.png'),
    'homepage-bg',
    { maxWidth: 1920, quality: 80 }
  );

  await optimizeImage(
    path.join(ASSETS_DIR, 'eu.png'),
    'eu',
    { maxWidth: 400, quality: 85 }
  );

  await optimizeImage(
    path.join(ASSETS_DIR, 'stacks.png'),
    'stacks',
    { maxWidth: 800, quality: 80 }
  );

  console.log('\nDone! Optimized images in src/assets/optimized/');
}

main().catch(console.error);
