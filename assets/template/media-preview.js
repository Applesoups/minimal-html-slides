// Shared fullscreen media preview. Video progress returns to its original element.
(()=>{
 const style=document.createElement('style');
 style.textContent=`.reveal .slides video,.reveal .slides img,.reveal .slides image{cursor:zoom-in}
 .media-preview{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;padding:36px;box-sizing:border-box;animation:media-preview-enter .4s ease-out both}
 .media-preview img,.media-preview video{display:block;width:auto;height:auto;max-width:calc(100vw - 72px);max-height:calc(100vh - 72px);object-fit:contain;margin:0}
 .media-preview video,.media-preview img{width:calc(100vw - 72px);height:calc(100vh - 72px)}
 .media-preview-close{position:absolute;right:18px;top:14px;width:44px;height:44px;border:1px solid #777;border-radius:50%;background:#202020;color:white;font:32px/1 Arial;cursor:pointer;z-index:1}
 .media-preview.closing{pointer-events:none;animation:media-preview-exit .4s ease-out both}
 @keyframes media-preview-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
 @keyframes media-preview-exit{from{opacity:1}to{opacity:0}}`;
 document.head.appendChild(style);
 let modal,original,large,wasPlaying,previousFocus;
 function close(){
  if(!modal)return;
  const old=modal;modal=null;
  if(original){
   const time=large.readyState>=1?large.currentTime:original.currentTime;
   large.pause();original.currentTime=time;
   if(wasPlaying&&original.closest('section')===Reveal.getCurrentSlide())original.play().catch(()=>{});
  }
  original=null;large=null;
  old.classList.add('closing');setTimeout(()=>old.remove(),400);
  previousFocus?.focus?.({preventScroll:true});
 }
 function open(media){
  if(modal)return;
  previousFocus=document.activeElement;
  modal=document.createElement('div');modal.className='media-preview';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Fullscreen media preview');
  const button=document.createElement('button');button.className='media-preview-close';button.textContent='×';button.setAttribute('aria-label','Close fullscreen preview');button.addEventListener('click',close);
  if(media.tagName.toLowerCase()==='video'){
   original=media;wasPlaying=!media.paused;const time=media.currentTime;media.pause();
   large=media.cloneNode(true);large.removeAttribute('style');large.removeAttribute('class');large.removeAttribute('id');large.removeAttribute('data-id');large.controls=true;large.autoplay=false;
   const current=large;
   current.addEventListener('loadedmetadata',()=>{if(large!==current)return;current.currentTime=time;if(wasPlaying)current.play().catch(()=>{});},{once:true});
  }else{
   large=document.createElement('img');large.alt=media.getAttribute('alt')||media.getAttribute('aria-label')||'Slide image';
   const nested=media.closest('svg');
   if(media.tagName.toLowerCase()==='svg'||(media.namespaceURI==='http://www.w3.org/2000/svg'&&nested?.parentElement?.closest('svg'))){
    const clone=nested.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.removeAttribute('style');clone.removeAttribute('x');clone.removeAttribute('y');
    large.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone));
   }else large.src=media.currentSrc||media.src||media.getAttribute('href')||media.getAttributeNS('http://www.w3.org/1999/xlink','href');
  }
  modal.append(large,button);modal.addEventListener('click',e=>{if(e.target===modal)close();});document.body.appendChild(modal);button.focus({preventScroll:true});
 }
 document.addEventListener('click',e=>{
  if(e.button!==0||modal?.contains(e.target)||!e.target.closest('.reveal .slides section.present'))return;
  let media=e.target.closest('video,img,image');
  if(!media){
   const nested=e.target.closest('svg');
   if(nested?.parentElement?.closest('svg'))media=nested.querySelector('image');
   // Pure vector figures also enlarge; clicking their blank canvas still advances.
   if(!media&&nested&&e.target.tagName.toLowerCase()!=='svg'&&!nested.querySelector('video,foreignObject,image'))media=nested;
  }
  if(!media)return;
  e.preventDefault();e.stopImmediatePropagation();open(media);
 },true);
 document.addEventListener('keydown',e=>{if(!modal)return;e.stopImmediatePropagation();if(e.key==='Escape'){e.preventDefault();close();}},true);
 Reveal.on('slidechanged',close);
})();
