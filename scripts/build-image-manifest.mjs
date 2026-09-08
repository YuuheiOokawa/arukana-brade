/** Catalog actual files and their alpha bounds; never invent a spritesheet path. */
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
const root = 'public/assets/images/characters/units';
const assets = {};
for (const directory of (await readdir(root, {withFileTypes:true})).filter(d=>d.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name))) {
  for(const name of (await readdir(`${root}/${directory.name}`)).filter(f=>f.endsWith('.webp')).sort()) {
    const src = `/${root.slice(7)}/${directory.name}/${name}`;
    const {data,info} = await sharp(`public${src}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let left=info.width, top=info.height, right=0, bottom=0;
    for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) if(data[(y*info.width+x)*4+3]>8) { left=Math.min(left,x); top=Math.min(top,y); right=Math.max(right,x); bottom=Math.max(bottom,y); }
    if(left>right) continue;
    // Existing sheets include printed rarity labels above the illustration.
    // Remove that header only for the known legacy 256x512 exports.
    if(info.width===256 && info.height===512) top=Math.max(top,36);
    assets[src]={width:info.width,height:info.height,crop:[left,top,right-left+1,bottom-top+1]};
  }
}
let generated={};
try { generated=JSON.parse(await readFile('src/data/generated-character-art.json','utf8')); } catch(e) { if(e.code!=='ENOENT') throw e; }
await writeFile('src/data/character-art.json',JSON.stringify({assets,generated},null,2)+'\n');
console.log(`Catalogued ${Object.keys(assets).length} legacy portraits and ${Object.keys(generated).length} generated characters.`);
