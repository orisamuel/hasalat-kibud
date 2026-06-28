/* =========================================================
   טבלת הכיבוד · חסלט
   טבלת הרשמה לכיבוד. איך שמתחילים — כל השורות נחטפות ע"י הורים
   אחרים תוך שניות, ונשארת רק שורה אחת ריקה: כרובית ללא חרקים.
   ========================================================= */
'use strict';

/* ---------------- data ---------------- */
const ITEMS = [
  { id:'pita',    emoji:'🫓', name:'חבילת פיתות' },
  { id:'cups',    emoji:'🥤', name:'שרוול כוסות חד״פ' },
  { id:'drinks',  emoji:'🧃', name:'שתייה קלה' },
  { id:'snacks',  emoji:'🍿', name:'חטיפים ובמבה' },
  { id:'napkins', emoji:'🧻', name:'מפיות וצלחות חד״פ' },
  { id:'cookies', emoji:'🍪', name:'עוגיות לקינוח' },
  { id:'melon',   emoji:'🍉', name:'אבטיח חתוך' },
  { id:'cauli',   emoji:'🥦', name:'כרובית ללא חרקים', hero:true },
];

const PARENTS = [
  'אמא של רוני','אבא של שגב','אמא של ליאם','אמא של נועה','סבתא של יהלי',
  'אמא של אדם','אבא של תמר','אמא של אלמה','אמא של דניאל','אמא של מעיין',
  'אבא של איתי','אמא של שירה','הגננת רוחי','הסייעת ז׳קלין','אמא של עידו',
  'אמא של יעל','אבא של בן','אמא של רומי',
];

/* coach line per item as it gets snatched (by id), + generic fallback */
const SNATCH_TALK = {
  pita:   'אוי לא, נגמרו הפיתות! מהר לכוסות! 😱',
  cups:   'גם הכוסות הלכו?! מי האנשים האלה 😤',
  drinks: 'השתייה נחטפה. אל תילחץ, יש עוד...',
  snacks: 'הבמבה? ברצינות? נשאר עוד מעט...',
  napkins:'גם המפיות. מתחיל להיות מביך 😅',
  cookies:'העוגיות עפו. נשאר... את יודעת מה.',
  melon:  'גם האבטיח! טוב, זהו, נשאר רק דבר אחד 👀',
};
const INTRO_LINE  = 'רשמו את שמכם ליד מה שתביאו — מי שמקדים זוכה בקלים! 💪';
const RUSH_LINE   = 'רוצים פיתות? קדימה! ... רגע, מה? כולם נכנסו ביחד! 🏃💨';
const HERO_LINE   = 'נשארה רק <b>כרובית ללא חרקים</b> 🥦 — היא כולה שלך, אלוף. רשמו שם וזהו!';
const DONE_LINE   = 'כל הכבוד! נרשמת כמו אלוף 🏆 (אלוף של כרובית, אבל אלוף).';

const PUNCHES = [
  'אבל בוא נודה — זה הכיבוד הכי בריא בכל המסיבה 😌',
  'הילדים יתעלמו ממנה. ההורים יזכרו אותך לנצח 🥦',
  'ניצחת! פשוט בקטגוריה של "תזונה נכונה" 🏆',
  'לפחות אצלך אין חרקים. אצל אמא של רוני? מי יודע... 😏',
];

/* ---------------- state ---------------- */
const S = { started:false, done:false, muted:false, audioReady:false, timers:[], t0:0, ahead:0 };

/* ---------------- elements ---------------- */
const $ = (s,el=document)=>el.querySelector(s);
const rowsEl   = $('#rows');
const coachBub = $('#coachBubble');
const coachAv  = $('#coachAvatar');
const startBtn = $('#startBtn');
const overlay  = $('#overlay');

/* ---------------- coach avatar (inline SVG) ---------------- */
const COACH_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="המנחה">
  <ellipse cx="50" cy="57" rx="30" ry="28" fill="#ffd9b0"/>
  <path d="M16 50 Q50 6 84 50 Q50 38 16 50 Z" fill="#6FB23C"/>
  <path d="M14 50 Q50 44 86 50 L86 56 Q50 50 14 56 Z" fill="#4f8f2a"/>
  <circle cx="50" cy="20" r="4.5" fill="#4f8f2a"/>
  <circle cx="40" cy="55" r="4.4" fill="#222"/>
  <circle cx="60" cy="55" r="4.4" fill="#222"/>
  <circle cx="38.4" cy="53.6" r="1.4" fill="#fff"/>
  <circle cx="58.4" cy="53.6" r="1.4" fill="#fff"/>
  <path class="mouth" d="M38 68 Q50 80 62 68" stroke="#7a3b22" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="63" cy="72" r="5.3" fill="#e23b2e" stroke="#fff" stroke-width="1.6"/>
</svg>`;
const MOUTHS = { happy:'M38 68 Q50 80 62 68', oops:'M40 73 Q50 65 60 73', flat:'M40 71 L60 71' };
function setCoach(html, mood='happy'){
  coachBub.innerHTML = html;
  coachBub.style.animation='none'; void coachBub.offsetWidth; coachBub.style.animation='';
  const m = coachAv.querySelector('.mouth');
  if(m) m.setAttribute('d', MOUTHS[mood]||MOUTHS.happy);
}

/* ---------------- helpers ---------------- */
const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const wait = (fn,ms)=>{ const t=setTimeout(fn,ms); S.timers.push(t); return t; };
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers=[]; }

let parentPool=[];
function nextParent(){
  if(!parentPool.length) parentPool=[...PARENTS].sort(()=>Math.random()-0.5);
  return parentPool.pop();
}

/* ---------------- toasts ---------------- */
let toastsEl;
function toast(html, burn=false){
  if(!toastsEl){ toastsEl=document.createElement('div'); toastsEl.className='toasts'; document.body.appendChild(toastsEl); }
  const t=document.createElement('div');
  t.className='toast'+(burn?' toast--burn':'');
  t.innerHTML=html;
  toastsEl.appendChild(t);
  wait(()=>t.remove(), 2300);
}

/* ---------------- build table ---------------- */
function buildRows(){
  rowsEl.innerHTML='';
  ITEMS.forEach(it=>{
    const li=document.createElement('li');
    li.className='row'+(it.hero?' row--hero':' row--clickable');
    li.dataset.id=it.id;
    li.innerHTML=`
      <div class="row__item"><span class="emoji">${it.emoji}</span><span class="name">${it.name}</span></div>
      <div class="row__who">${it.hero?'':'<span class="row__free">פנוי ✍️</span>'}</div>`;
    if(!it.hero) li.addEventListener('click',()=>beginRush(it.id));
    rowsEl.appendChild(li);
  });
}

/* ---------------- rush: everything gets snatched ---------------- */
function beginRush(firstId){
  if(S.started) return;
  S.started=true;
  S.t0=performance.now();
  clearTimers();
  startBtn.classList.add('is-hidden');
  setCoach(RUSH_LINE,'oops');
  initAudio();

  // order of easy items; if the player reached for a specific one, snatch it first
  let order=ITEMS.filter(it=>!it.hero).map(it=>it.id);
  if(firstId){ order=order.filter(id=>id!==firstId); order.unshift(firstId); }

  // lock all rows from further clicks
  rowsEl.querySelectorAll('.row--clickable').forEach(r=>r.classList.remove('row--clickable'));

  order.forEach((id,i)=>{
    const delay = (i===0?120:300) + i*200 + Math.random()*110;
    wait(()=>snatchRow(id, i===0 && !!firstId), delay);
  });

  const total = 120 + order.length*200 + 300;
  wait(openHeroRow, total);
}

function snatchRow(id, wasYourReach){
  const li=rowsEl.querySelector(`.row[data-id="${id}"]`);
  if(!li || li.classList.contains('row--snatched')) return;
  const it=ITEMS.find(x=>x.id===id);
  const who=nextParent();
  S.ahead++;

  li.classList.add('row--snatched','flash');
  const whoCell=li.querySelector('.row__who');
  whoCell.innerHTML=`<span class="signed">${who}</span><span class="taken-tag">תפוס!</span>`;

  playPop();
  if(wasYourReach) toast(`<span class="hand">🤚</span> מאוחר מדי! ${who} חטף/ה את ${it.name} שנייה לפניך 😩`, true);

  // coach reacts to specific items
  if(SNATCH_TALK[id]) setCoach(SNATCH_TALK[id], id==='melon'?'flat':'oops');
}

function openHeroRow(){
  const li=rowsEl.querySelector('.row--hero');
  li.classList.add('is-open');
  setCoach(HERO_LINE,'happy');
  playDing();

  const whoCell=li.querySelector('.row__who');
  whoCell.innerHTML=`
    <input class="name-input" id="nameInput" type="text" maxlength="22"
           placeholder="כתבו את שמכם כאן..." autocomplete="off" />
    <button class="name-go" id="nameGo">רישום ✍️</button>`;

  const input=$('#nameInput');
  $('#nameGo').addEventListener('click',register);
  input.addEventListener('keydown',e=>{ if(e.key==='Enter') register(); });
  setTimeout(()=>input.focus(),200);
}

/* ---------------- register your name ---------------- */
function register(){
  if(S.done) return;
  const input=$('#nameInput');
  const name=(input.value||'').trim();
  if(!name){
    input.style.borderColor='var(--danger)';
    input.placeholder='נו, כתבו שם 🙂';
    input.focus();
    return;
  }
  S.done=true;
  const li=rowsEl.querySelector('.row--hero');
  li.classList.remove('is-open');
  li.querySelector('.row__who').innerHTML=`<span class="signed" style="color:#1c7a1c">${escapeHtml(name)}</span>`;
  setCoach(DONE_LINE,'happy');
  playWin();
  wait(()=>showResult(name), 700);
}

/* ---------------- result ---------------- */
function showResult(name){
  if(!S.done) return;            // bail if the game was reset before this fired
  const secs=Math.max(1.6,(performance.now()-S.t0)/1000);
  $('#resultHello').textContent=`${name}, היא כולה שלך.`;
  const stats=$('#resultStats'); stats.innerHTML='';
  [
    ['🏃 הורים שהקדימו אותך', S.ahead],
    ['⏱️ תוך כמה זמן נגמר הכל', secs.toFixed(1)+' שניות'],
    ['🥦 מה שנשאר לך', 'כרובית · 1'],
  ].forEach(([l,v])=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${l}</span><b>${v}</b>`;
    stats.appendChild(li);
  });
  $('#resultPunch').textContent=rand(PUNCHES);
  overlay.classList.add('is-open');
  launchConfetti();
}

function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

/* ---------------- restart ---------------- */
function restart(){
  clearTimers();
  S.started=false; S.done=false; S.ahead=0; parentPool=[];
  overlay.classList.remove('is-open');
  startBtn.classList.remove('is-hidden');
  setCoach(INTRO_LINE,'happy');
  buildRows();
  scheduleIdleAutostart();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* the table fills itself if you just stand there too long */
function scheduleIdleAutostart(){
  wait(()=>{ if(!S.started) setCoach('נו... כולם כבר נרשמים! 👀', 'flat'); }, 4000);
  wait(()=>{ if(!S.started) beginRush(null); }, 7000);
}

/* ---------------- share ---------------- */
function share(){
  const url=location.href.split('#')[0];
  const text =
    'ניסיתי להירשם לכיבוד של מסיבת הגן... ונתקעתי עם כרובית ללא חרקים 🥦😂\n'+
    'נסו להספיק להירשם למשהו קל לפני כולם (ספוילר: לא תצליחו):\n'+url+'\n'+
    'בחסות חסלט — הטעם הנקי של הטבע 🌱';
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');
}

/* ---------------- confetti (no libs) ---------------- */
function launchConfetti(){
  const cv=$('#confetti'); const ctx=cv.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; ctx.scale(dpr,dpr);
  const colors=['#6FB23C','#4f8f2a','#8fce5a','#1c1c1c','#ffffff'];
  const parts=Array.from({length:120},()=>({
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
      ctx.fillStyle=p.c; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore();
    });
    if(++frames<260) requestAnimationFrame(loop);
    else ctx.clearRect(0,0,innerWidth,innerHeight);
  })();
}

/* ---------------- audio (tiny WebAudio) ---------------- */
let AC=null, masterGain=null;
function initAudio(){
  if(S.audioReady) return;
  try{
    AC=new (window.AudioContext||window.webkitAudioContext)();
    masterGain=AC.createGain(); masterGain.gain.value=S.muted?0:0.5;
    masterGain.connect(AC.destination); S.audioReady=true;
  }catch(e){}
}
function tone(freq,dur,type='sine',vol=0.3){
  if(!S.audioReady||S.muted) return;
  const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,AC.currentTime);
  g.gain.linearRampToValueAtTime(vol,AC.currentTime+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+dur);
  o.connect(g); g.connect(masterGain); o.start(); o.stop(AC.currentTime+dur);
}
const playPop  =()=>tone(520,0.08,'square',0.16);
const playDing =()=>tone(880,0.18,'triangle',0.22);
function playWin(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'triangle',0.26),i*110)); }

/* ---------------- mute ---------------- */
function toggleMute(){
  S.muted=!S.muted;
  const b=$('#muteBtn'); b.textContent=S.muted?'🔇':'🔊'; b.classList.toggle('is-muted',S.muted);
  if(masterGain) masterGain.gain.value=S.muted?0:0.5;
}

/* ---------------- wire up ---------------- */
coachAv.innerHTML=COACH_SVG;
overlay.classList.remove('is-open');   // never start with the popup open
buildRows();
setCoach(INTRO_LINE,'happy');
scheduleIdleAutostart();

/* if the page is restored from the browser's back/forward cache after a
   finished game, reset it to a fresh table instead of the stuck popup */
window.addEventListener('pageshow', e=>{ if(e.persisted) restart(); });
startBtn.addEventListener('click',()=>beginRush(null));
$('#againBtn').addEventListener('click',restart);
$('#shareBtn').addEventListener('click',share);
$('#muteBtn').addEventListener('click',toggleMute);
window.addEventListener('resize',()=>{ const cv=$('#confetti'); if(cv){ cv.width=innerWidth; cv.height=innerHeight; } });
