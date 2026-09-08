import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
const job=JSON.parse(process.argv[2]);
const dir='public/assets/images/characters/generated';
await mkdir(dir,{recursive:true});
const name=`characters-${job.units[0].id.slice(5)}-${job.units.at(-1).id.slice(5)}.webp`;
const output=`${dir}/${name}`;
await sharp(job.path).webp({quality:92}).toFile(output);
const {width,height}=await sharp(output).metadata();
let generated={},prompts={};
try { generated=JSON.parse(await readFile('src/data/generated-character-art.json','utf8')); } catch(e) {if(e.code!=='ENOENT')throw e;}
try { prompts=JSON.parse(await readFile('docs/character-art-prompts.json','utf8')); } catch(e) {if(e.code!=='ENOENT')throw e;}
job.units.forEach((u,i)=>{const x=Math.round(i%5*width/5),right=Math.round((i%5+1)*width/5),y=Math.floor(i/5)*height/2;generated[u.id]={src:`/assets/images/characters/generated/${name}`,width,height,crop:[x,y,right-x,height/2]};});
prompts[name]={units:job.units.map(u=>({id:u.id,name:u.name})),prompt:job.prompt,method:'Built-in image generation; loss-limited WebP encoding; SVG viewport cropping.'};
await writeFile('src/data/generated-character-art.json',JSON.stringify(generated,null,2)+'\n');
await writeFile('docs/character-art-prompts.json',JSON.stringify(prompts,null,2)+'\n');
console.log(`${name}: ${job.units.length} characters`);
