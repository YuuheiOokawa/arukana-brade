import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const output='test-results';mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5177','--strictPort'],{stdio:'pipe'});
let browser;
try {
  await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(d.toString().includes('Local:'))resolve();});server.on('error',reject);server.on('exit',code=>reject(new Error(`Vite exited: ${code}`)));});
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const report=[];
  const context=await browser.newContext();
  await context.route('**/api/**',r=>{
    const isSummon=r.request().postData()?.includes('summon_save');
    return r.fulfill({status:200,contentType:'application/json',body:isSummon?'{"ok":true}':'{}'});
  });
  const fontDir=process.env.QA_FONT_DIR;
  if(fontDir) await context.route('**/__qa-fonts/**',r=>r.fulfill({body:readFileSync(path.join(fontDir,'files',r.request().url().split('/').pop())),contentType:'font/woff2'}));
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const go=async(name)=>{
    await page.goto('http://127.0.0.1:5177/tests/ui/fixture.html?page='+name);
    await page.locator('.app-shell').waitFor();
  };
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:1000});
    for(const name of ['HomePage','UnitsPage','PartyPage','CollectionPage','QuestsPage','EnhancePage','EquipmentPage','ItemsPage','MissionsPage','ShopPage','ProfilePage','GiftBoxPage','GuildPage','FriendPage','PvPPage','RaidPage','SummonPage']) {
      await go(name);await page.waitForTimeout(150);
      const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,missing:[...document.querySelectorAll('img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src'))}));
      report.push({page:name,width,...layout,errors:errors.splice(0)});
      assert.equal(layout.overflow,false,`${name} overflows at ${width}`);assert.deepEqual(layout.missing,[],name);
      if(['HomePage','UnitsPage','ProfilePage','GuildPage','ItemsPage','ShopPage','MissionsPage','GiftBoxPage'].includes(name)) {
        if(fontDir) await page.addStyleTag({content:readFileSync(path.join(fontDir,'400.css'),'utf8').replaceAll('./files/','/__qa-fonts/')+'body,button,input,h1,h2,h3{font-family:"Noto Sans JP",sans-serif!important}'});
        await page.screenshot({path:`${output}/${name}-${width}.png`,fullPage:true,timeout:60000});
      }
    }
  }
  await go('ShopPage');
  await page.getByRole('button',{name:'アイテム',exact:true}).click();
  await page.getByRole('button',{name:/経験値の雫\(小\)/}).click();
  await page.getByRole('dialog',{name:'購入内容の確認'}).waitFor();
  assert.equal(await page.getByText('購入後の残高',{exact:true}).count(),1);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(),0);
  await go('ProfilePage');
  await page.getByRole('button',{name:'プロフィール編集',exact:true}).click();
  const nameInput = page.getByPlaceholder('プレイヤー名 (最大16文字)');
  const savedName = await nameInput.inputValue();
  await nameInput.fill('キャンセルする名前');
  await page.getByRole('button',{name:'キャンセル',exact:true}).click();
  await page.getByRole('button',{name:'プロフィール編集',exact:true}).click();
  assert.equal(await nameInput.inputValue(),savedName);
  await page.getByRole('button',{name:'キャンセル',exact:true}).click();
  await go('UnitsPage');
  await page.getByRole('textbox',{name:'ユニットを検索'}).fill('アルカナード');
  assert.equal(await page.locator('.unit-library-grid .unit-card').count(),1);
  await page.getByRole('button',{name:'検索をクリア'}).click();
  assert.equal(await page.locator('.unit-library-grid .unit-card').count(),20);
  await page.getByRole('button',{name:'メニュー',exact:true}).click();
  assert.equal(await page.locator('dialog').evaluate(d=>d.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').evaluate(d=>d.open),false);
  await page.locator('.unit-library-grid .unit-card').first().focus();await page.keyboard.press('Enter');
  assert.equal(await page.getByText('Lv.1 · 烈火の剣聖').count(),1);
  // Force duplicates: first nine N units, then the guaranteed SSR are already owned.
  await page.addInitScript(()=>{Math.random=()=>0;});
  await go('TutorialGachaScreen');
  await page.getByRole('button',{name:'10連召喚（無料）'}).click();
  await page.getByRole('button',{name:'SKIP'}).click();
  await page.waitForTimeout(3200);
  assert.equal(await page.getByRole('heading',{name:'召喚結果'}).count(),1);
  assert.equal(await page.getByRole('button',{name:'OPEN',exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>Object.values(window.__stores.units.getState().awakeningCrystals).reduce((sum,n)=>sum+n,0)),10);
  assert.equal(await page.evaluate(()=>window.__stores.units.getState().ownedUnits.length),20);
  await page.reload();
  assert.equal(await page.getByRole('button',{name:'10連召喚（無料）'}).count(),1); // fixture explicitly resets tutorial, production does not
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'10連召喚（無料）'}).click();
  assert.equal(await page.getByRole('heading',{name:'召喚結果'}).count(),1);
  report.push({interactions:['name search','clear search','menu/Escape','keyboard unit selection','tutorial skip remains on results','duplicate crystal grants','reduced motion'],errors:errors.splice(0)});
  assert.ok(report.every(r=>!r.errors.length),JSON.stringify(report.filter(r=>r.errors.length)));
  writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));
  console.log('PASS: 34 responsive views and 7 interaction checks. API responses were mocked.');
} finally { await browser?.close();server.kill(); }
