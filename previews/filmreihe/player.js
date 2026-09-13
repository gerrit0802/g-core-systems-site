(() => {
  const root=document.querySelector('.film-library');if(!root)return;
  const video=root.querySelector('video');const quality=root.querySelector('select');
  const buttons=[...root.querySelectorAll('[data-film]')];
  const episodes=[
    ['Ihre Idee. Ihr System.','Ein Einblick in G-Core Systems: individuelle Anwendungen für Unternehmen, Selbstständige und persönliche Ideen.','Das Studio','1:08'],
    ['Wissen. Agenten. Ihre Lösung.','Ein Servicefall zeigt, wie passende Quellen und spezialisierte Agenten einen nachvollziehbaren nächsten Schritt vorbereiten.','Wissen & Agenten','2:08'],
    ['Ihre Anforderungen werden zur Anwendung.','Eine verschobene Lieferung verändert die Montageplanung. Das Beispiel verbindet Abhängigkeiten, Zuständigkeiten und gemeinsame Freigaben.','Vernetzte Abläufe','2:10'],
    ['Von der Idee zum geprüften Ergebnis.','Eine neue Regel verändert ein Lernmodul zur Projektübergabe. Der Vergleich zeigt, wie eine gewünschte Funktion überprüfbar wird.','Überprüfbare Entwicklung','2:17']
  ];
  let selected=0;let generation=0;let pendingReady=null;
  const file=()=>`previews/filmreihe/media/folge-${String(selected+1).padStart(2,'0')}`;
  function load(preserve=false){
    const id=++generation;const time=preserve?video.currentTime:0;
    video.pause();
    if(pendingReady)video.removeEventListener('loadedmetadata',pendingReady);
    root.querySelector('[data-film-error]').hidden=true;
    video.poster=`${file()}.jpg`;video.setAttribute('aria-label',episodes[selected][0]);
    video.querySelector('source').src=`${file()}-${quality.value}.mp4`;
    video.querySelector('track').src=`${file()}.vtt`;
    root.querySelector('[data-film-file]').href=`${file()}-${quality.value}.mp4`;
    pendingReady=()=>{if(id===generation && time>0 && Number.isFinite(video.duration))video.currentTime=Math.min(time,video.duration);};
    video.addEventListener('loadedmetadata',pendingReady,{once:true});
    video.load(); // Selection never starts playback automatically.
  }
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{
    if(selected===index)return;selected=index;
    buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    root.querySelector('[data-film-title]').textContent=episodes[index][0];
    root.querySelector('[data-film-description]').textContent=episodes[index][1];
    root.querySelector('[data-film-chapter]').textContent=`0${index+1} / 04 · ${episodes[index][2]}`;
    root.querySelector('[data-film-length]').textContent=`${episodes[index][3]} · Folge 0${index+1}`;
    load();
  }));
  quality.addEventListener('change',()=>load(true));
  video.addEventListener('error',()=>{root.querySelector('[data-film-error]').hidden=false;});
  video.querySelector('source').addEventListener('error',()=>{root.querySelector('[data-film-error]').hidden=false;});
  document.addEventListener('play',event=>{if(event.target instanceof HTMLMediaElement)document.querySelectorAll('video,audio').forEach(other=>{if(other!==event.target)other.pause();});},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
  window.addEventListener('pagehide',()=>video.pause());
  document.querySelectorAll('[data-product-open]').forEach(button=>button.addEventListener('click',()=>video.pause()));
})();
