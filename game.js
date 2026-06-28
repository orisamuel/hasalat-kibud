/* =========================================================
   המאמן לכיבוד · חסלט
   המאמן מבטיח שתתפוס את הדברים הקלים — אבל אי אפשר לנצח אותו.
   כל הקלים נחטפים, ונשארת רק כרובית ללא חרקים (של חסלט 🥦).
   ========================================================= */
'use strict';

/* ---------------- data ---------------- */
const ITEMS = [
  { id:'pita',    emoji:'🫓', name:'חבילת פיתות',      effort:'קליל' },
  { id:'cups',    emoji:'🥤', name:'שרוול כוסות חד״פ', effort:'אפס מאמץ' },
  { id:'napkins', emoji:'🧻', name:'מפיות וצלחות',     effort:'קל' },
  { id:'drinks',  emoji:'🧃', name:'שתייה קלה',         effort:'קל' },
  { id:'snacks',  emoji:'🍿', name:'חטיפים ובמבה',      effort:'קליל' },
  { id:'cauli',   emoji:'🥦', name:'כרובית ללא חרקים',  effort:'פשוט 😏', hero:true },
];

const PARENTS = [
  'אמא של רוני','אבא של שגב','אמא של ליאם','אמא של נועה','סבתא של יהלי',
  'אמא של אדם','אבא של תמר','אמא של אלמה','אמא של דניאל','אמא של מעיין',
  'אבא של איתי','אמא של שירה','הגננת רוחי','הסייעת ז׳קלין','אמא של עידו',
  'אמא של יעל','אבא של בן','אמא של רומי','אמא של אריאל',
];

const SNATCH_LINES = [
  (p,it)=>`<span class="hand">🤚</span> ${p} חטף/ה ${it}!`,
  (p,it)=>`${p} הקדים/ה אותך ל${it} ב־0.3 שניות 😮‍💨`,
  (p,it)=>`${p} כבר רשמ/ה את עצמ/ה ל${it}. אכזרי.`,
  (p,it)=>`<span class="hand">🤚</span> נגמרו ה${it}! (${p})`,
];
const BURN_LINES = [
  (p,it)=>`כמעט! ${p} חטף/ה לך את ה${it} מתחת לאף 😩`,
  (p,it)=>`לחצת... אבל ${p} לחצ/ה מילישנייה לפניך 🫠`,
  (p,it)=>`וואו מהיר! חבל ש${p} מהיר/ה יותר 🤷`,
];

const ROUNDS = [
  {
    tag:'סיבוב 1 · החימום',
    hype:'בוא נתחיל קליל — <b>חבילת פיתות</b>. לחץ ברגע שאני שורק. אין מצב שנפספס! 💪',
    react:'אוף, פספסנו צ׳יק. זה בסדר, התחממנו. הסיבוב הבא שלנו! 😅',
    baseDelay:900, jitter:520, dodge:false, preSnatch:0,
  },
  {
    tag:'סיבוב 2 · מתחממים',
    hype:'טעות של מתחילים. הפעם לך על <b>כוסות חד״פ</b> — תהיה ערני, אני סופר לאחור! 🔥',
    react:'מה?! שוב הקדימו אותנו?! טוב, אני משנה טקטיקה. עוד פעם אחת! 😤',
    baseDelay:560, jitter:300, dodge:true, preSnatch:1,
  },
  {
    tag:'סיבוב 3 · הקרב האחרון',
    hype:'זהו, הולכים על הכל! מי שמהיר מנצח. תתכונן... אתה תתפוס משהו הפעם! ⚡',
    react:'לא יאומן. הם תמיד לפנינו. בוא... בוא נדבר רגע, אלוף. 😬',
    baseDelay:300, jitter:170, dodge:true, preSnatch:2,
  },
];

const FINAL = {
  tag:'ההצעה האחרונה',
  hype:'שמע, ניסינו הכל. נשארה רק <b>כרובית ללא חרקים</b>. ' +
       'אבל בוא נודה — לפחות היא של <b>חסלט</b>, נקייה לגמרי. קדימה, קח אותה גבר/גברת! 🥦',
};

const PUNCHES = [
  'אבל בוא נודה — זה הכיבוד הכי בריא בכל המסיבה 😌',
  'הילדים יתעלמו ממנה. ההורים יזכרו אותך לנצח. 🥦',
  'ניצחת! פשוט בקטגוריה של "תזונה נכונה". 🏆',
  'לפחות אצלך אין חרקים. אצל אמא של רוני? מי יודע... 😏',
];

/* ---------------- state ---------------- */
const S = {
  round:0,
  ahead:0,
  snatched:0,
  frustration:0,
  timers:[],
  active:false,
  muted:false,
  audioReady:false,
};

/* ---------------- elements ---------------- */
const $  = (s,el=document)=>el.querySelector(s);
const screens = {
  start:$('#screen-start'),
  game :$('#screen-game'),
  end  :$('#screen-end'),
};
const board     = $('#board');
const ledgerEl  = $('#ledgerList');
const toastsEl  = $('#toasts');
const coachBub  = $('#coachBubble');
const coachAv   = $('#coachAvatar');
const roundTag  = $('#roundTag');
const countdown = $('#countdown');
const cdNum     = $('#cdNum');
const frustFill = $('#frustFill');
const aheadEl   = $('#aheadCount');

/* ---------------- coach avatar (inline SVG) ---------------- */
const COACH_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="המאמן">
  <ellipse cx="50" cy="55" rx="30" ry="30" fill="#ffd9b0"/>
  <ellipse cx="50" cy="58" rx="30" ry="27" fill="#ffd9b0"/>
  <path d="M16 50 Q50 6 84 50 Q50 38 16 50 Z" fill="#6FB23C"/>
  <path d="M14 50 Q50 44 86 50 L86 56 Q50 50 14 56 Z" fill="#4f8f2a"/>
  <circle cx="50" cy="20" r="4.5" fill="#4f8f2a"/>
  <circle class="eye" cx="40" cy="55" r="4.4" fill="#222"/>
  <circle class="eye" cx="60" cy="55" r="4.4" fill="#222"/>
  <circle cx="38.4" cy="53.6" r="1.4" fill="#fff"/>
  <circle cx="58.4" cy="53.6" r="1.4" fill="#fff"/>
  <path class="mouth" d="M38 68 Q50 80 62 68" stroke="#7a3b22" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="63" cy="72" r="5.5" fill="#e23b2e" stroke="#fff" stroke-width="1.6"/>
</svg>`;
const MOOD_MOUTH = {
  strong:'M38 68 Q50 80 62 68',     // grin
  sheepish:'M40 72 Q50 66 60 72',   // small frown
  shrug:'M40 71 L60 71',            // flat
  zen:'M40 70 Q50 76 60 70',        // gentle
};
function setCoach(text, mood='strong'){
  coachBub.innerHTML = text;
  coachBub.style.animation='none'; void coachBub.offsetWidth; coachBub.style.animation='';
  const m = coachAv.querySelector('.mouth');
  if(m) m.setAttribute('d', MOOD_MOUTH[mood]||MOOD_MOUTH.strong);
}

/* ---------------- helpers ---------------- */
const rand  = arr => arr[Math.floor(Math.random()*arr.length)];
const wait  = (fn,ms)=>{ const t=setTimeout(fn,ms); S.timers.push(t); return t; };
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers=[]; }
function show(name){
  Object.values(screens).forEach(s=>s.classList.remove('is-active'));
  screens[name].classList.add('is-active');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* a fresh pool of parent names so nobody repeats too fast */
let parentPool = [];
function nextParent(){
  if(parentPool.length===0) parentPool = [...PARENTS].sort(()=>Math.random()-0.5);
  return parentPool.pop();
}

/* ---------------- ledger + toasts + meters ---------------- */
function ledgerAdd(who, what, isYou=false){
  const empty = ledgerEl.querySelector('.ledger__empty');
  if(empty) empty.remove();
  const li=document.createElement('li');
  li.className='ledger__row'+(isYou?' ledger__row--you':'');
  li.innerHTML = `<span class="who">${who}</span><span class="arrow">←</span><span class="what">${what}</span>`;
  ledgerEl.prepend(li);
  while(ledgerEl.children.length>14) ledgerEl.lastChild.remove();
}
function toast(html, burn=false){
  const t=document.createElement('div');
  t.className='toast'+(burn?' toast--burn':'');
  t.innerHTML=html;
  toastsEl.appendChild(t);
  wait(()=>t.remove(), 2600);
}
function bumpFrustration(n){
  S.frustration=Math.min(100,S.frustration+n);
  frustFill.style.width=S.frustration+'%';
}
function bumpAhead(){ S.ahead++; aheadEl.textContent=S.ahead; }

/* ---------------- board build ---------------- */
function buildBoard(items){
  board.innerHTML='';
  items.forEach(it=>{
    const card=document.createElement('button');
    card.className='item'+(it.hero?' item--hero':'');
    card.dataset.id=it.id;
    card.innerHTML=`
      <span class="item__emoji">${it.emoji}</span>
      <span class="item__name">${it.name}</span>
      <span class="item__effort">${it.effort}</span>`;
    card.addEventListener('click',()=>onItemClick(it,card));
    if(!it.hero){
      // easy items literally dodge the cursor in later rounds
      card.addEventListener('mouseenter',()=>maybeDodge(card));
    }
    board.appendChild(card);
  });
}
function maybeDodge(card){
  if(!S.active || card.classList.contains('item--snatched')) return;
  const cfg=ROUNDS[S.round];
  if(!cfg || !cfg.dodge) return;
  const dx=(Math.random()*2-1)*42, dy=(Math.random()*2-1)*26;
  card.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/10}deg)`;
  wait(()=>{ if(!card.classList.contains('item--snatched')) card.style.transform=''; },260);
}

/* ---------------- snatch logic ---------------- */
function snatchCard(card, byPlayer=false){
  if(card.classList.contains('item--snatched')) return;
  const id=card.dataset.id;
  const it=ITEMS.find(x=>x.id===id);
  if(!it || it.hero) return;
  const who=nextParent();
  card.classList.add('item--snatched');
  card.style.transform='';
  const stamp=document.createElement('div');
  stamp.className='item__stamp';
  stamp.innerHTML=`<span class="x">נחטף!</span><span class="by">${who}</span>`;
  card.appendChild(stamp);

  const line = byPlayer ? rand(BURN_LINES) : rand(SNATCH_LINES);
  toast(line(who, it.name), byPlayer);
  ledgerAdd(who, it.name);
  bumpAhead();
  bumpFrustration(byPlayer?16:11);
  playSnatch();

  if(allEasyGone()) onAllGone();
}
function allEasyGone(){
  return [...board.querySelectorAll('.item:not(.item--hero)')]
          .every(c=>c.classList.contains('item--snatched'));
}

/* ---------------- player clicks ---------------- */
function onItemClick(it, card){
  if(!S.active) return;
  if(it.hero){ takeCauliflower(); return; }
  if(card.classList.contains('item--snatched')) return;
  // you can NEVER get an easy item — clicking it = instant burn
  card.classList.add('shake');
  snatchCard(card, true);
  playSad();
}

/* ---------------- round flow ---------------- */
function startGame(){
  initAudio();
  clearTimers();
  S.round=0; S.ahead=0; S.snatched=0; S.frustration=0; S.active=false;
  parentPool=[];
  aheadEl.textContent='0';
  frustFill.style.width='0%';
  ledgerEl.innerHTML='<li class="ledger__empty">עוד רגע כולם נכנסים...</li>';
  show('game');
  runRound(0);
}

function runRound(i){
  clearTimers();
  S.round=i;
  const cfg=ROUNDS[i];
  roundTag.textContent=cfg.tag;
  roundTag.style.animation='none'; void roundTag.offsetWidth; roundTag.style.animation='';
  setCoach(cfg.hype,'strong');
  buildBoard(ITEMS);
  S.active=false;
  runCountdown(()=>beginRush(cfg));
}

function runCountdown(done){
  countdown.hidden=false;
  countdown.classList.remove('go');
  let n=3;
  cdNum.textContent=n;
  cdNum.style.animation='none'; void cdNum.offsetWidth; cdNum.style.animation='';
  playWhistle(880);
  const tick=()=>{
    n--;
    if(n>0){
      cdNum.textContent=n;
      cdNum.style.animation='none'; void cdNum.offsetWidth; cdNum.style.animation='';
      playWhistle(760+n*60);
      wait(tick,800);
    }else{
      countdown.classList.add('go');
      cdNum.textContent='זינוק!';
      playWhistle(1180,0.22);
      wait(()=>{ countdown.hidden=true; done(); },520);
    }
  };
  wait(tick,800);
}

function beginRush(cfg){
  S.active=true;
  const easy=[...board.querySelectorAll('.item:not(.item--hero)')];

  // in later rounds, a couple get snatched the instant the whistle blows
  for(let k=0;k<cfg.preSnatch && k<easy.length;k++){
    wait(()=>snatchCard(easy[k]), 60+k*90);
  }
  // schedule the rest — fast, faster each round, impossible to beat
  easy.forEach((card,idx)=>{
    if(idx<cfg.preSnatch) return;
    const delay=cfg.baseDelay + Math.random()*cfg.jitter + idx*40;
    wait(()=>snatchCard(card), delay);
  });

  // make the cauliflower obviously available
  const hero=board.querySelector('.item--hero');
  if(hero) hero.classList.add('glow');

  // safety: if somehow nothing fired, move on
  wait(()=>{ if(S.active && allEasyGone()) onAllGone(); }, cfg.baseDelay+cfg.jitter+700);
}

function onAllGone(){
  if(!S.active) return;
  S.active=false;
  const cfg=ROUNDS[S.round];
  if(S.round < ROUNDS.length-1){
    setCoach(cfg.react,'sheepish');
    playSad();
    wait(()=>runRound(S.round+1), 1700);
  }else{
    wait(finalOffer, 1300);
  }
}

function finalOffer(){
  roundTag.textContent=FINAL.tag;
  roundTag.style.animation='none'; void roundTag.offsetWidth; roundTag.style.animation='';
  setCoach(FINAL.hype,'zen');
  // only the cauliflower remains, big and glowing
  buildBoard(ITEMS.filter(it=>it.hero));
  const hero=board.querySelector('.item--hero');
  if(hero) hero.classList.add('glow');
  S.active=true;
}

function takeCauliflower(){
  if(!S.active) return;
  S.active=false;
  clearTimers();
  ledgerAdd('אתה 🫵', 'כרובית ללא חרקים', true);
  playWin();
  wait(endGame, 260);
}

/* ---------------- end ---------------- */
function endGame(){
  show('end');
  const stats=$('#resultStats');
  stats.innerHTML='';
  const rows=[
    ['🏃 הורים שהקדימו אותך', S.ahead],
    ['😤 מד תסכול סופי', S.frustration+'%'],
    ['🥦 ירקות נקיים שתפסת', '1'],
  ];
  rows.forEach(([label,val])=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${label}</span><b>${val}</b>`;
    stats.appendChild(li);
  });
  $('#resultPunch').textContent=rand(PUNCHES);
  launchConfetti();
}

/* ---------------- share ---------------- */
function share(){
  const url=location.href.split('#')[0];
  const text =
    'ניסיתי להירשם לכיבוד של מסיבת הגן... ונתקעתי עם כרובית ללא חרקים 🥦😂\n'+
    'נסו לתפוס משהו קל לפניי (ספוילר: לא תצליחו):\n'+url+'\n'+
    'בחסות חסלט — הטעם הנקי של הטבע 🌱';
  const wa='https://wa.me/?text='+encodeURIComponent(text);
  window.open(wa,'_blank','noopener');
}

/* ---------------- confetti (no libs) ---------------- */
function launchConfetti(){
  const cv=$('#confetti'); const ctx=cv.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; ctx.scale(dpr,dpr);
  const colors=['#6FB23C','#4f8f2a','#8fce5a','#1c1c1c','#ffffff'];
  const N=120;
  const parts=Array.from({length:N},()=>({
    x:Math.random()*innerWidth, y:-20-Math.random()*innerHeight*0.5,
    r:5+Math.random()*7, c:rand(colors),
    vx:(Math.random()*2-1)*1.4, vy:2+Math.random()*3.5,
    rot:Math.random()*6.28, vr:(Math.random()*2-1)*0.2,
  }));
  let frames=0;
  (function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.vy+=0.02;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.c; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6);
      ctx.restore();
    });
    frames++;
    if(frames<260) requestAnimationFrame(loop);
    else ctx.clearRect(0,0,innerWidth,innerHeight);
  })();
}

/* ---------------- audio (tiny WebAudio, optional) ---------------- */
let AC=null, masterGain=null;
function initAudio(){
  if(S.audioReady) return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    masterGain=AC.createGain();
    masterGain.gain.value=S.muted?0:0.5;
    masterGain.connect(AC.destination);
    S.audioReady=true;
  }catch(e){ /* no audio, no problem */ }
}
function tone(freq,dur,type='sine',vol=0.3){
  if(!S.audioReady||S.muted) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,AC.currentTime);
  g.gain.linearRampToValueAtTime(vol,AC.currentTime+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+dur);
  o.connect(g); g.connect(masterGain);
  o.start(); o.stop(AC.currentTime+dur);
}
const playWhistle=(f=900,d=0.16)=>tone(f,d,'triangle',0.25);
const playSnatch =()=>{ tone(520,0.08,'square',0.18); };
function playSad(){ tone(300,0.18,'sawtooth',0.18); setTimeout(()=>tone(230,0.26,'sawtooth',0.16),120); }
function playWin(){
  [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'triangle',0.28),i*110));
}

/* ---------------- mute ---------------- */
function toggleMute(){
  S.muted=!S.muted;
  const b=$('#muteBtn');
  b.textContent=S.muted?'🔇':'🔊';
  b.classList.toggle('is-muted',S.muted);
  if(masterGain) masterGain.gain.value=S.muted?0:0.5;
}

/* ---------------- wire up ---------------- */
coachAv.innerHTML=COACH_SVG;
document.querySelectorAll('.coach--big .coach__avatar').forEach(el=>el.innerHTML=COACH_SVG);
$('#startBtn').addEventListener('click',startGame);
$('#againBtn').addEventListener('click',startGame);
$('#shareBtn').addEventListener('click',share);
$('#muteBtn').addEventListener('click',toggleMute);
window.addEventListener('resize',()=>{
  const cv=$('#confetti'); if(cv){ cv.width=innerWidth; cv.height=innerHeight; }
});
