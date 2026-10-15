// Navigation and motion shared by every generated deck.
Reveal.initialize({width:1280,height:720,margin:.04,center:false,hash:true,controls:true,progress:false,transition:'fade',transitionSpeed:'default',keyboard:true,touch:true,overview:true,help:true});
document.addEventListener('click',e=>{if(Reveal.isOverview()||e.button!==0||e.target.closest('a,button,video,img,image,input,textarea,.controls,.prompt-scroll,.media-preview'))return;Reveal.next();});
const playback=new Map();let activeSlide=null,mediaEpoch=0;
async function resumeMedia(slide){
 const token=++mediaEpoch;
 if(activeSlide)activeSlide.querySelectorAll('video[data-id]').forEach(v=>{playback.set(v.dataset.id,v.currentTime);v.pause();});
 activeSlide=slide;
 for(const v of slide?.querySelectorAll('video[data-id]')||[]){
  if(v.readyState<1)await new Promise(r=>v.addEventListener('loadedmetadata',r,{once:true}));
  if(token!==mediaEpoch)return;
  const time=playback.get(v.dataset.id);if(time!==undefined&&Math.abs(v.currentTime-time)>.04)v.currentTime=time;
  if(v.closest('.fragment:not(.visible)'))continue;
  v.play().catch(()=>{});
 }
}
const resume=e=>setTimeout(()=>{if(Reveal.getCurrentSlide()===e.currentSlide)resumeMedia(e.currentSlide);},0);
Reveal.on('ready',resume);Reveal.on('slidechanged',resume);
Reveal.on('fragmentshown',e=>{for(const f of e.fragments||[e.fragment])setTimeout(()=>{if(!f.closest('section.present')||!f.classList.contains('visible'))return;f.querySelectorAll('video').forEach(v=>v.play().catch(()=>{}));},parseFloat(f.style.getPropertyValue('--reveal-delay'))||0);});
Reveal.on('fragmenthidden',e=>(e.fragments||[e.fragment]).forEach(f=>f.querySelectorAll('video').forEach(v=>v.pause())));
// Only related focus views skip the ordinary crossfade.
Reveal.on('beforeslidechange',e=>{
 const from=Reveal.getCurrentSlide(),to=Reveal.getSlide(e.indexh,e.indexv);if(!from||!to||from===to)return;
 const shared=from.dataset.autoAnimateId&&from.dataset.autoAnimateId===to.dataset.autoAnimateId;
 const focus=from.dataset.focusKey&&from.dataset.focusKey===to.dataset.focusKey;
 from.dataset.transition=to.dataset.transition=shared||focus?'none':'fade';
});
// A focus frame expands/collapses without crossfading or losing word alignment.
(()=>{
 let cleanup=()=>{};
 const easing='cubic-bezier(.22,1,.36,1)';
 Reveal.on('slidechanged',e=>{
  cleanup();const from=e.previousSlide,to=e.currentSlide;
  if(!from?.dataset.focusKey||from.dataset.focusKey!==to.dataset.focusKey)return;
  const key=to.dataset.focusKey,oldPanel=from.querySelector(`[data-panel="${key}"]`),newPanel=to.querySelector(`[data-panel="${key}"]`),oldTitle=from.querySelector(`[data-heading="${key}"]`),newTitle=to.querySelector(`[data-heading="${key}"]`);
  if(!oldPanel||!newPanel)return;
  const bbox=r=>({x:+r.getAttribute('x'),y:+r.getAttribute('y'),w:+r.getAttribute('width'),h:+r.getAttribute('height')});
  const a=bbox(oldPanel),b=bbox(newPanel),effects=[],copies=[];let timer;
  const mapped=(p,q)=>{const sx=p.w/q.w,sy=p.h/q.h;return `translate(${p.x-q.x*sx}px,${p.y-q.y*sy}px) scale(${sx},${sy})`;};
  if(to.classList.contains('focus-detail')){
   newPanel.style.transformOrigin='0 0';effects.push(newPanel.animate([{transform:mapped(a,b)},{transform:'translate(0px,0px) scale(1,1)'}],{duration:850,easing}));
   // Title stays single-line on the detail page.
   const oldWords=[...oldTitle.querySelectorAll('tspan')];
   if(oldWords.length>1){
    newTitle.style.visibility='hidden';let offset=0;
    for(const span of oldWords){const word=span.textContent,x=newTitle.getStartPositionOfChar(offset).x+newTitle.getSubStringLength(offset,word.length)/2,copy=newTitle.cloneNode(false);copy.textContent=word;copy.setAttribute('x',x);to.querySelector('svg').appendChild(copy);copies.push(copy);copy.style.transformOrigin='0 0';const scale=24/30;effects.push(copy.animate([{transform:`translate(${+span.getAttribute('x')-x*scale}px,${+span.getAttribute('y')-205*scale}px) scale(${scale})`},{transform:'none'}],{duration:850,easing,fill:'both'}));offset+=word.length+1;}
   }else{const scale=24/30,x=+oldTitle.getAttribute('x'),y=+oldTitle.getAttribute('y');newTitle.style.transformOrigin='0 0';effects.push(newTitle.animate([{transform:`translate(${x-640*scale}px,${y-205*scale}px) scale(${scale})`},{transform:'none'}],{duration:850,easing}));}
  }else{
   const svg=to.querySelector('svg'),panel=oldPanel.cloneNode(true),heading=oldTitle.cloneNode(true);svg.append(panel,heading);copies.push(panel,heading);newPanel.style.visibility=newTitle.style.visibility='hidden';
   panel.style.transformOrigin=heading.style.transformOrigin='0 0';effects.push(panel.animate([{transform:'none'},{transform:mapped(b,a)}],{duration:850,easing,fill:'both'}));
   const spans=[...newTitle.querySelectorAll('tspan')];
   if(spans.length>1){
    let offset=0;
    for(const span of spans){const word=span.textContent,start=heading.getStartPositionOfChar(offset).x,x=start+heading.getSubStringLength(offset,word.length)/2,copy=heading.cloneNode(false);copy.textContent=word;copy.setAttribute('x',x);svg.appendChild(copy);copies.push(copy);copy.style.transformOrigin='0 0';const s=24/30,tx=+span.getAttribute('x'),ty=+span.getAttribute('y');effects.push(copy.animate([{transform:'none'},{transform:`translate(${tx-x*s}px,${ty-205*s}px) scale(${s})`}],{duration:850,easing,fill:'both'}));offset+=word.length+1;}heading.style.visibility='hidden';
   }else{const s=24/30,x=+newTitle.getAttribute('x'),y=+newTitle.getAttribute('y');effects.push(heading.animate([{transform:'none'},{transform:`translate(${x-640*s}px,${y-205*s}px) scale(${s})`}],{duration:850,easing,fill:'both'}));}
  }
  cleanup=()=>{clearTimeout(timer);effects.forEach(a=>a.cancel());copies.forEach(n=>n.remove());newPanel.style.removeProperty('visibility');newTitle.style.removeProperty('visibility');cleanup=()=>{};};timer=setTimeout(cleanup,860);
 });
})();
// Optional timed text scroll, stopping on page exit and finishing within its budget.
(()=>{
 let frame,timer,epoch=0;
 function start(slide){clearTimeout(timer);cancelAnimationFrame(frame);const token=++epoch,editor=slide?.querySelector('[data-scroll-ms]');if(!editor)return;editor.scrollTop=0;let started;const duration=+editor.dataset.scrollMs;
  timer=setTimeout(()=>{const tick=t=>{if(token!==epoch||Reveal.getCurrentSlide()!==slide)return;if(started===undefined)started=t;const ratio=Math.min((t-started)/duration,1);editor.scrollTop=(editor.scrollHeight-editor.clientHeight)*ratio;if(ratio<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);},600);
 }
 Reveal.on('ready',e=>start(e.currentSlide));Reveal.on('slidechanged',e=>start(e.currentSlide));
})();

// Overview navigation bypasses fragments and media preview interactions.
(() => {
 let lastStep = 0, delta = 0;
 document.addEventListener('wheel', e => {
  if (!Reveal.isOverview() || document.querySelector('.media-preview')) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const now = performance.now();
  if (now - lastStep < 220) return;
  const movement = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (movement === 0) return;
  const pixels = movement * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  delta = Math.sign(delta) === Math.sign(pixels) ? delta + pixels : pixels;
  if (Math.abs(delta) < 30) return;
  const pages = Reveal.getHorizontalSlides();
  const h = Reveal.getIndices().h;
  Reveal.slide(Math.max(0, Math.min(pages.length - 1, h + Math.sign(delta))));
  delta = 0;
  lastStep = now;
 }, {capture:true, passive:false});
 document.addEventListener('click', e => {
  if (!Reveal.isOverview() || e.button !== 0 || document.querySelector('.media-preview')) return;
  const slide = e.target.closest('.reveal .slides section');
  if (!slide) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const {h,v} = Reveal.getIndices(slide);
  Reveal.slide(h,v);
  Reveal.toggleOverview(false);
 }, true);
 Reveal.on('overviewshown', () => { delta = 0; lastStep = 0; });
})();
