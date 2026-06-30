/**
 * split-character-images.mjs
 * 1枚の画像に8キャラ(4列×2行)が含まれているファイルを
 * ★1～★7、★Crown の8ファイルに分割する
 */
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SRC_DIR = path.join(ROOT, 'public', 'キャラ画像');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'images', 'characters', 'units');

// 出力先のファイル名サフィックス（グリッド位置順: 左→右、上→下）
// 上段: ★1 ★2 ★3 ★4   下段: ★5 ★6 ★7 ★Crown
const RARITY_SUFFIXES = ['1', '2', '3', '4', '5', '6', '7', 'crown'];

// スケール後のターゲットサイズ（各スライス）
const TARGET_WIDTH = 256;
const TARGET_HEIGHT = 512;

async function splitImage(srcFile, unitId) {
  const meta = await sharp(srcFile).metadata();
  const { width, height } = meta;

  const colCount = 4;
  const rowCount = 2;
  const cellW = Math.floor(width / colCount);
  const cellH = Math.floor(height / rowCount);

  const outDir = path.join(OUT_DIR, unitId);
  await fs.mkdir(outDir, { recursive: true });

  console.log(`  ${unitId}: ${width}x${height} → cells ${cellW}x${cellH}`);

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const idx = row * colCount + col;
      const suffix = RARITY_SUFFIXES[idx];

      // 最後の列・行は余りピクセルも含める
      const extractW = col === colCount - 1 ? width - cellW * (colCount - 1) : cellW;
      const extractH = row === rowCount - 1 ? height - cellH * (rowCount - 1) : cellH;

      const outFile = path.join(outDir, `${unitId}_${suffix}.webp`);

      await sharp(srcFile)
        .extract({
          left: col * cellW,
          top: row * cellH,
          width: extractW,
          height: extractH,
        })
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
          position: 'top',
        })
        .webp({ quality: 85 })
        .toFile(outFile);

      console.log(`    → ${path.basename(outFile)}`);
    }
  }
}

async function main() {
  const files = await fs.readdir(SRC_DIR);
  const webpFiles = files.filter(f => f.match(/^unit_\d+\.(webp|png|jpg|jpeg)$/i));

  console.log(`Found ${webpFiles.length} source images`);

  for (const file of webpFiles) {
    const unitId = path.basename(file, path.extname(file)); // 'unit_001'
    const srcPath = path.join(SRC_DIR, file);
    try {
      await splitImage(srcPath, unitId);
    } catch (err) {
      console.error(`  ERROR processing ${file}:`, err.message);
    }
  }

  console.log('\nDone!');
  console.log('Output:', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
