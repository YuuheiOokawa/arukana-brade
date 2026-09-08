import catalog from '../data/character-art.json';
export interface CharacterArt { src:string; width:number; height:number; crop:number[]; }
const assets = catalog.assets as Record<string, Omit<CharacterArt, 'src'>>;
const generated = catalog.generated as Record<string, CharacterArt>;
const BASE_PATH = '/assets/images/characters/units';
export const RARITY_TO_IMAGE_SUFFIX: Record<number,string> = {1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'crown'};
export const UNIT_IMAGE_FALLBACK = '/assets/images/characters/portrait-unavailable.svg';
export function starRarityToImageRarity(star:number|string):number {
  if(String(star).toLowerCase()==='crown') return 8;
  const n=Number(star);
  return Number.isInteger(n) && n>=1 && n<=8 ? n : 1;
}
export function getUnitImagePath(unitId:string,rarity:number|string):string|null {
  const match=unitId.match(/^(unit_\d{3}|hero_[a-z]+)(?:[_-].*)?$/);
  if(!match) return null;
  const id=match[1];
  const preferred=`${BASE_PATH}/${id}/${id}_${RARITY_TO_IMAGE_SUFFIX[starRarityToImageRarity(rarity)]}.webp`;
  if(assets[preferred]) return preferred;
  if(generated[id]) return generated[id].src;
  return null;
}
let imageCache = new Map<string,string>();
export function populateImageCache(images:Array<{unitId:string;rarity:number;imagePath:string}>) {
  imageCache=new Map(images.filter(i=>i.imagePath).map(i=>[`${i.unitId}_${i.rarity}`,i.imagePath]));
}
export function resolveUnitImage(unitId:string,rarity:number|string):string {
  return imageCache.get(`${unitId}_${starRarityToImageRarity(rarity)}`) ?? getUnitImagePath(unitId,rarity) ?? UNIT_IMAGE_FALLBACK;
}
export function getCharacterArt(src:string,unitId?:string):CharacterArt|null {
  if(assets[src]) return {src,...assets[src]};
  if(unitId && generated[unitId]?.src===src) return generated[unitId];
  return null;
}
