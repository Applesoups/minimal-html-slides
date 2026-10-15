#!/usr/bin/env node
// Optional real-browser checks. Requires Playwright, but building does not.
const {chromium}=require('playwright');const {pathToFileURL}=require('url');const path=require('path');
(async()=>{
 const file=process.argv[2];if(!file)throw Error('Usage: node check_deck.cjs /absolute/path/slides.html');
 const browser=await chromium.launch({args:['--no-sandbox']});const issues=[],errors=[];
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>Reveal.isReady());
  const count=await page.evaluate(()=>document.querySelectorAll('.slides>section').length);
  for(let i=0;i<count;i++){
   await page.evaluate(i=>Reveal.slide(i,0,-1),i);await page.waitForTimeout(450);
   let clicks=0;while(await page.evaluate(()=>Reveal.nextFragment())){clicks++;if(clicks>100)throw Error('Fragment loop did not terminate');await page.waitForTimeout(80);}
   await page.waitForTimeout(1050);
   const result=await page.evaluate(()=>{const s=Reveal.getCurrentSlide();const title=s.querySelector('h2'),titleTop=title?.getBoundingClientRect().top;return {titleTop,hidden:[...s.querySelectorAll('[style]')].filter(e=>e.style.visibility==='hidden').length,images:[...s.querySelectorAll('img')].every(e=>e.complete&&e.naturalWidth>0),videos:[...s.querySelectorAll('video[data-id]')].filter(v=>!v.closest('.fragment:not(.visible)')).map(v=>({id:v.dataset.id,ready:v.readyState>=1,playing:!v.paused}))};});
   if(result.titleTop>140||result.hidden||!result.images||result.videos.some(v=>!v.ready||!v.playing))issues.push({page:i+1,...result});
  }
  const shared=await page.evaluate(()=>{const sections=[...document.querySelectorAll('.slides>section')];for(let i=0;i<sections.length-1;i++){const a=sections[i].querySelector('video[data-id]'),b=sections[i+1].querySelector('video[data-id]');if(a&&b&&a.dataset.id===b.dataset.id)return {i,id:a.dataset.id};}return null;});
  if(shared){
   await page.evaluate(i=>Reveal.slide(i),shared.i);await page.waitForTimeout(500);await page.evaluate(()=>{Reveal.getCurrentSlide().querySelector('video').currentTime=2;});await page.evaluate(()=>Reveal.next());await page.waitForTimeout(500);
   const continued=await page.evaluate(()=>Reveal.getCurrentSlide().querySelector('video').currentTime>=2);if(!continued)issues.push({test:'shared video restarted'});
   const slide=await page.evaluate(()=>Reveal.getIndices().h);await page.locator('section.present video').first().dispatchEvent('click');await page.waitForFunction(()=>document.querySelector('.media-preview video')?.readyState>=1);await page.waitForTimeout(200);const time=await page.locator('.media-preview video').evaluate(v=>v.currentTime);await page.keyboard.press('Escape');await page.waitForTimeout(450);
   const restored=await page.evaluate(()=>({modal:!!document.querySelector('.media-preview'),slide:Reveal.getIndices().h,time:Reveal.getCurrentSlide().querySelector('video').currentTime}));if(restored.modal||restored.slide!==slide||restored.time<time-.15)issues.push({test:'fullscreen exit/progress',restored});
  }
  console.log(JSON.stringify({pages:count,errors,issues},null,2));if(errors.length||issues.length)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
