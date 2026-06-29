/* =========================================================
   שיבוץ לכיבוד · חסלט
   1) מוקאפ קבוצת ווצאפ (רנדומלי) → הגננת שולחת קישור לשיבוץ
   2) לוחצים על הקישור → טבלת שיבוץ שנחטפת תוך שניות
   3) תמיד נשארות 2 אופציות מופרכות (אחת הזויה רנדומלית + מגש ירקות)
   4) פעם ב~8 נשאר משהו קל לתפיסה
   ========================================================= */
'use strict';

/* ------------------- chat data ------------------- */
const GROUPS = [
  {n:'גן חבצלת 🌸 · הורים', a:'🌸'}, {n:'כיתה א׳2 — שלובים', a:'🎒'},
  {n:'חוג כדורגל יום ג׳ ⚽', a:'⚽'}, {n:'אמהות תות 🍓', a:'🍓'},
  {n:'ועד הורים — גן רקפת', a:'🌼'}, {n:'צהרון נופר 🌈', a:'🌈'},
  {n:'חוג בלט · קבוצת הבוקר', a:'🩰'}, {n:'גן זית · שכבת נץ', a:'🫒'},
];
const TEACHERS = ['הגננת רוני','המורה ציפי','רוחי הסייעת','דנה המדריכה','שירלי רכזת החוג','המורה אורית','עפרי הגננת'];
const PARENTS  = ['חמוטל','שגב','איציק','מאיה','ליאת','קובי','רויטל','אבי','נטלי','משה','עדי','תמי','גיא','שיר','אורנה'];
const COLORS   = ['#e0457b','#1f8acb','#6a4ee0','#d97706','#0c8f6e','#b8366b','#3a7bd5','#a3439b'];

const INTRO = [
  'ערב טוב הורים יקרים 💚\nמצרפת טבלת שיבוץ לכיבוד מסיבת סוף השנה. נא למלא מול מה שתביאו 🙏',
  'היי לכולם! 🌟\nקישור לשיבוץ הכיבוד למסיבה. תתפסו מקום לפני שנגמר 😉',
  'שלום הורים 🙂\nמצרפת את הטבלה לחלוקת הכיבוד. מי שלא ממלא — מפתיע אותנו בכרובית 😅',
  'בוקר טוב 🌞\nטבלת הכיבוד למסיבה מצורפת. כל אחד מול שם, תודה רבה!',
];
const CANT = [
  'רגע, אי אפשר למלא ✋','זה נפתח לי רק לקריאה 🤨','מה זה, לא נותן לי לכתוב כלום',
  'אצלי הכל אפור, אי אפשר ללחוץ על כלום','ניסיתי, זה לא שומר לי את השם',
];
const ACCESS = [
  '@{teacher} את צריכה לתת הרשאת עריכה 🙈','צריך לשנות ל״כל מי שיש לו קישור יכול לערוך״',
  'תני גישת עריכה לכולם, עכשיו זה נעול 🔒','@{teacher} זה במצב צפייה בלבד, תשני בהגדרות שיתוף',
];
const FIXED = [
  'אופס 😅 תוקן, תנסו עכשיו!','סליחה! עכשיו פתוח לכולם. רוצו 🏃‍♀️',
  'מצטערת, תיקנתי 🙏 קדימה לפני שחוטפים את הקל','הנה, פתחתי לעריכה. בהצלחה 😄',
];
const CHEEKY = [
  '@{p} שיבצתי אותך לקיסמים, אל תתווכחי 😘','אני כבר תפסתי מפיות 🙌 בהצלחה לשאר',
  '@{p} לקחתי לך פיתות, תודה אחר כך 😏','תכל׳ס תפסתי גם פיתות וגם כוסות. אלוף 💪',
];
// the "whoever's slow gets stuck with the cauliflower" line — varied each game
const STUCK = [
  'מי שלא יספיק — נתקע עם הכרובית 🥦😈',
  'מי שישן מביא מגש ירקות. כלל ידוע 😇',
  'המאחרים מביאים את הסלט, מזכירה 😏',
  'מי שלא זריז — שמיר ופטרוזיליה עליו 🌿',
  'האחרון שנשאר? כרובית ללא חרקים. סורי 🤷‍♀️',
  'מי שמתמהמה מביא את הדבר הכי מסובך, ידוע 🙃',
];
const FILLER = ['😂😂','וואי איזה מהירים','תודה {teacher}! 🙏','אני בחו״ל, תשבצו אותי למשהו קל 🙏','אנשים, תנו לאחרים גם 😤'];

/* ------------------- table data ------------------- */
const SILLY = [
  {e:'🛍️',n:'שקית ניילון של רמי לוי'},{e:'🧻',n:'גליל נייר טואלט',s:'שכבה אחת'},
  {e:'💧',n:'בקבוק מים',s:'מהברז'},{e:'🧂',n:'ממלחה'},{e:'🥄',n:'כפית פלסטיק',s:'אחת'},
  {e:'🧊',n:'קוביות קרח'},{e:'🍬',n:'סוכרייה בודדת'},{e:'🍞',n:'קצה של חלה',s:'מאתמול'},
  {e:'🧅',n:'בצל אחד'},{e:'🥢',n:'קיסמים'},{e:'🥤',n:'קשיות'},
];
const CLASSIC = [   // כולם: בלי הכנה — יש בבית או קונים מוכן בקלות
  {e:'🫓',n:'חבילת פיתות'},{e:'🥤',n:'שרוול כוסות חד״פ'},{e:'🧃',n:'בקבוק מיץ ענבים'},
  {e:'🍿',n:'במבה וביסלי'},{e:'🍪',n:'חבילת עוגיות',s:'קנויות'},{e:'🧻',n:'מפיות וצלחות'},
  {e:'🍫',n:'שוקולד למריחה'},{e:'🍉',n:'אבטיח',s:'שלם, לא חתוך'},
  {e:'🥨',n:'מארז בייגלה'},{e:'🧇',n:'חבילת ופלים'},{e:'🥤',n:'בקבוק קולה'},
];
const ABSURD = [
  {e:'🍄',n:'פטריות שיטאקי מוקפצות',s:'על מצע אבקת חד-קרן'},
  {e:'🦄',n:'קצף יוניקורן',s:'בציפוי זהב אכיל 24 קראט'},
  {e:'🫕',n:'פונדו שוקולד בלגי',s:'עם עלי זהב ודמעות שמחה'},
  {e:'🐉',n:'ביצי דרקון עלובה',s:'ברוטב יוזו-לבנדר'},
  {e:'🧚',n:'סופלה לבנדר',s:'על מצע ערפל בוקר'},
  {e:'🪐',n:'אוויר צח מהאלפים',s:'מנה ל-12 סועדים'},
  {e:'🍦',n:'גלידת דמדומים סגולה',s:'בטעם של יום שישי אחה״צ'},
  {e:'🌫️',n:'ערפל הרים כבוש בצנצנת',s:'נקטף עם הזריחה'},
  {e:'⭐',n:'קונפי כוכבים',s:'על מצע אבק ירח'},
  {e:'🌈',n:'קשת בענן מזוגגת בסילאן',s:'מנה אחת בעולם'},
  {e:'🕯️',n:'קרם ברולה',s:'בטעם ריח של גשם ראשון'},
  {e:'🧊',n:'גלידת חנקן נוזלי',s:'בטעם יום שלישי'},
  {e:'🪺',n:'קן אכיל מקש סוכר',s:'ברוטב טל בוקר'},
  {e:'🤫',n:'תמצית שתיקה מזוקקת',s:'מהרי ההימלאיה'},
  {e:'🌵',n:'ריבת קקטוס פורח',s:'אחת ל-100 שנה'},
  {e:'🪷',n:'עלי לוטוס ממולאים',s:'באור ירח'},
  {e:'🍯',n:'דבש מדבורים שמנגנות ויולה'},
  {e:'🧁',n:'קאפקייק מרחף',s:'3 ס״מ מעל הצלחת'},
  {e:'🪨',n:'אבני נהר מסוכרות',s:'ברוטב אבק כוכבים'},
  {e:'🌙',n:'חצי ירח מצופה מרנג'},
  {e:'❄️',n:'פתיתי שלג מהקוטב',s:'נשמרים קפואים עד ההגשה'},
  {e:'🌬️',n:'סופלה רוח צפונית',s:'מתאדה תוך 8 שניות'},
  {e:'🫧',n:'בועות סבון אכילות',s:'בטעם ילדות'},
  {e:'🌋',n:'הר געש שוקולד',s:'מתפרץ כל 12 דקות'},
  {e:'🛸',n:'צלחת מעופפת ממרציפן',s:'עם נוסעים'},
];
const VEG = {e:'🥗',n:'מגש ירקות חתוכים',s:'חסה, סלרי, גזר, שמיר ופטרוזיליה/כוסברה לבחירתכם',veg:true};

const LOSE_STAMP = ['נגמר.','פספסת.','איחרת.','אאוץ׳.'];
const LOSE_TITLE = ['כל הכיבוד נחטף.','היית איטי מדי.','שובצת ל… כלום.','כולם הקדימו אותך.'];
const LOSE_BRAND = 'לא נורא, הפעם לא הצלחת. קשה באימונים קל בקרב, אבל אם כבר ירקות אז רק של <b>חסלט</b>. גם נקיים מחרקים וגם מפוקחים משאריות חומרי הדברה. <span class="wink">(היינו חייבים את המסר השיווקי כאן כדי להצדיק את המימון של הפיתוח)</span>';

/* ------------------- state ------------------- */
const S = { muted:false, audioReady:false, timers:[], chatDone:false };
const game = {};

/* ------------------- elements ------------------- */
const $ = (s,el=document)=>el.querySelector(s);
const screens = { chat:$('#screen-chat'), table:$('#screen-table') };
const waChat=$('#waChat'), waName=$('#waName'), waAvatar=$('#waAvatar'), waSub=$('#waSub'), waHint=$('#waHint');
const rowsEl=$('#rows'), statusEl=$('#status'), overlay=$('#overlay');

/* ------------------- helpers ------------------- */
const rand    = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(p=>p[1]);
const wait    = (fn,ms)=>{ const t=setTimeout(fn,ms); S.timers.push(t); return t; };
function clearTimers(){ S.timers.forEach(clearTimeout); S.timers=[]; }
function show(name){ Object.values(screens).forEach(s=>s.classList.remove('is-active')); screens[name].classList.add('is-active'); window.scrollTo(0,0); }
function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function fmt(t){ return escapeHtml(t).replace(/@[֐-׿\w]+/g,m=>`<span class="at">${m}</span>`).replace(/\n/g,'<br>'); }

let parentPool=[];
function nextParent(){ if(!parentPool.length) parentPool=shuffle([...PARENTS]); return parentPool.pop(); }

let toastsEl;
function toast(html,burn){
  if(!toastsEl){ toastsEl=document.createElement('div'); toastsEl.className='toasts'; document.body.appendChild(toastsEl); }
  const t=document.createElement('div'); t.className='toast'+(burn?' toast--burn':''); t.innerHTML=html;
  toastsEl.appendChild(t); wait(()=>t.remove(),2300);
}
function status(html,rush){ statusEl.innerHTML=html; statusEl.classList.toggle('is-rush',!!rush);
  statusEl.style.animation='none'; void statusEl.offsetWidth; statusEl.style.animation=''; }

/* ================= WHATSAPP INTRO ================= */
let linkEl=null;
function buildScript(){
  const group=rand(GROUPS), teacher=rand(TEACHERS), ps=shuffle([...PARENTS]);
  const colorMap={}; let ci=0;
  const colorOf=n=>colorMap[n]||(colorMap[n]=COLORS[(ci++)%COLORS.length]);
  const steps=[
    {kind:'msg', who:teacher, text:rand(INTRO)},
    {kind:'link'},
    {kind:'msg', who:ps[0], text:rand(CANT)},
    {kind:'msg', who:ps[1], text:rand(ACCESS).replace('{teacher}',teacher)},
    {kind:'msg', who:teacher, text:rand(FIXED), unlock:true},
    {kind:'msg', who:ps[2], text:rand(CHEEKY).replace('{p}',ps[3])},
    {kind:'msg', who:ps[3], text:rand(STUCK)},
  ];
  if(Math.random()<0.5) steps.push({kind:'msg', who:ps[4], text:rand(FILLER).replace('{teacher}',teacher)});
  return {group, sub:(11+Math.floor(Math.random()*24))+' משתתפים', colorOf, steps};
}

function renderMsg(step,t){
  const div=document.createElement('div'); div.className='msg';
  div.innerHTML=`<div class="msg__who" style="color:${game.script.colorOf(step.who)}">${escapeHtml(step.who)}</div>`+
    `<div class="msg__txt">${fmt(step.text)}</div><span class="msg__time">${t}</span>`;
  waChat.appendChild(div); scrollChat();
}
function renderLink(){
  linkEl=document.createElement('div'); linkEl.className='linkcard';
  linkEl.innerHTML=`
    <div class="linkcard__prev"><div class="linkcard__ico">📋</div>
      <div class="linkcard__t"><b>טבלת כיבוד · מסיבת סוף שנה</b><span>גיליון שיתופי · שיבוץ הורים</span></div></div>
    <div class="linkcard__url"><span>docs.kibud-sheet.co.il/שיבוץ</span><span class="linkcard__lock">🔒 צפייה בלבד</span></div>`;
  linkEl.addEventListener('click',onLinkClick);
  waChat.appendChild(linkEl); scrollChat();
}
function unlockLink(){ if(!linkEl) return; linkEl.classList.add('is-live');
  linkEl.querySelector('.linkcard__lock').textContent='🟢 פתוח לעריכה'; }
function onLinkClick(){
  if(!linkEl.classList.contains('is-live')){ toast('🔒 עדיין צפייה בלבד… רגע, נותנים גישה'); return; }
  playDing(); startTable();
}
function showTyping(){ const d=document.createElement('div'); d.className='typing';
  d.innerHTML='<span></span><span></span><span></span>'; waChat.appendChild(d); scrollChat(); return d; }
function scrollChat(){ waChat.scrollTop=waChat.scrollHeight; }
function clock(i){ return '20:'+String(8+i).padStart(2,'0'); }

function playChat(){
  S.chatDone=false; linkEl=null;
  game.script=buildScript();
  waName.textContent=game.script.group.n; waAvatar.textContent=game.script.group.a; waSub.textContent=game.script.sub;
  waChat.innerHTML='<div class="wa__date">היום</div><div class="wa__enc">🔒 ההודעות מוצפנות מקצה לקצה. גם הכרובית.</div>';
  waHint.hidden=true;
  let i=0;
  const step=()=>{
    if(i>=game.script.steps.length){ finishChat(); return; }
    const s=game.script.steps[i];
    if(s.kind==='link'){ renderLink(); playPop(); i++; wait(step,520+Math.random()*300); return; }
    const typ=showTyping();
    wait(()=>{ typ.remove(); renderMsg(s,clock(i)); playPop(); if(s.unlock) unlockLink(); i++; wait(step,430+Math.random()*360); },
         620+Math.random()*640);
  };
  wait(step,500);
}
function finishChat(){ S.chatDone=true; unlockLink(); waHint.hidden=false; }
function skipChat(){
  clearTimers();
  waChat.innerHTML='<div class="wa__date">היום</div><div class="wa__enc">🔒 ההודעות מוצפנות מקצה לקצה. גם הכרובית.</div>';
  game.script.steps.forEach((s,i)=>{ if(s.kind==='link') renderLink(); else renderMsg(s,clock(i)); });
  finishChat();
}

/* ================= TABLE ================= */
function rowHtml(it, whoHtml){
  return `<div class="row__item"><span class="emoji">${it.e}</span>`+
    `<span class="name">${escapeHtml(it.n)}${it.s?`<small>${escapeHtml(it.s)}</small>`:''}</span></div>`+
    `<div class="row__who">${whoHtml}</div>`;
}
function startTable(){
  clearTimers();
  show('table');
  status('הטבלה נפתחה! מהרו לשבץ את עצמכם 👇');
  buildTable();
  wait(beginRush, 850);
}
function buildTable(){
  game.over=false; game.won=false; game.snatched=0; parentPool=[];
  const normals = shuffle([ ...shuffle([...SILLY]).slice(0,3), ...shuffle([...CLASSIC]).slice(0,3) ]);
  game.normals = normals;
  game.absurd  = rand(ABSURD);
  game.finalTwo= [game.absurd, VEG];
  game.canWin  = Math.random() < 1/9;   // ~1 in 9 games: clicking a free row in time actually works
  game.rowOf   = new Map();

  rowsEl.innerHTML='';
  [...normals, ...game.finalTwo].forEach(it=>{
    const li=document.createElement('li');
    li.className='row row--clickable';
    li.innerHTML=rowHtml(it,'<span class="row__free">פנוי ✍️</span>');
    li.addEventListener('click',()=>onRowClick(li,it));
    game.rowOf.set(it,li);
    rowsEl.appendChild(li);
  });
}
function beginRush(){
  if(game.over) return;
  game.t0=performance.now();
  status('כולם נכנסו בדיוק עכשיו! 😳', true);
  const order = game.normals
    .map(it=>({it,silly:SILLY.includes(it)}))
    .sort((a,b)=> (b.silly?1:0)-(a.silly?1:0));   // the too-easy stuff goes first
  order.forEach((o,k)=> wait(()=>snatchRow(game.rowOf.get(o.it),o.it,false), 260+k*240+Math.random()*120));
  wait(()=>{ if(!game.over) finishLose(); }, 260+order.length*240+520);
}
function snatchRow(li,it,byPlayer,silent){
  if(game.over || !li || li.classList.contains('row--snatched')) return;
  const who=nextParent();
  li.classList.remove('row--clickable');
  li.classList.add('row--snatched','flash');
  li.querySelector('.row__who').innerHTML=`<span class="signed">${who}</span><span class="taken-tag">שובץ</span>`;
  game.snatched++;
  playPop();
  if(byPlayer) toast(`<span class="hand">🤚</span> מאוחר מדי! ${who} חטף/ה את ${it.n} לפניך 😩`, true);
  if(!silent){
    if(game.snatched===2) status('נחטף. נחטף. 😶', true);
    else if(game.snatched===4) status('כולם מהירים ממך. תמיד היו.', true);
  }
}
function onRowClick(li,it){
  if(game.over) return;
  if(game.finalTwo.includes(it)){ finishLose(it); return; }   // picked one of the two leftovers
  if(li.classList.contains('row--snatched')) return;          // already taken
  if(game.canWin && !game.won){ winGrab(li,it); return; }     // ~1/9: you clicked in time and it counts
  snatchRow(li,it,true);                                      // otherwise — snatched from under you
}
function winGrab(li,it){
  game.won=true; game.over=true; clearTimers();
  li.classList.remove('row--clickable');
  li.classList.add('row--win');
  li.querySelector('.row__who').innerHTML='<span class="signed" style="color:#1c7a1c">את/ה 🎉</span>';
  status('מה?! הספקת לפני כולם?! 🤯');
  playWin();
  wait(()=>showResult('win',{item:it}), 800);
}
function finishLose(chosen){
  if(game.result) return;            // already resolving
  game.over=true; game.result='lose'; clearTimers();
  game.rowOf.get(game.finalTwo[0]).classList.add('row--left');
  game.rowOf.get(game.finalTwo[1]).classList.add('row--left');
  status('זהו. נשארו רק אלה 👇 איפה לשבץ אותך?');
  wait(()=>showResult('lose',{}), chosen?900:2800);   // give a few seconds to read the list
}

/* ================= RESULT ================= */
function leftCard(it, variant){
  return `<div class="left-card left-card--${variant}"><span class="e">${it.e}</span>`+
    `<div class="t"><b>${escapeHtml(it.n)}</b>${it.s?`<span>${escapeHtml(it.s)}</span>`:''}</div></div>`;
}
function showResult(kind,data){
  const url=location.href.split('#')[0];
  if(kind==='win'){
    $('#resultStamp').textContent='רגע מה?!';
    $('#resultTitle').innerHTML='הספקת!! <span class="hl">🤯</span>';
    $('#resultSub').innerHTML=`תפסת <b>${escapeHtml(data.item.n)}</b> לפני כולם. תצלם מסך — אף אחד לא יאמין לך.`;
    $('#resultLeft').innerHTML=leftCard(data.item,'veg');
    $('#resultBrand').innerHTML='אבל היי — אם כבר מביאים, ירקות של <b>חסלט</b> תמיד מנצחים: נקיים מחרקים ובלי שאריות חומרי הדברה. <span class="wink">(חייבים להגניב פרסומת, אחרת מי יממן את זה 😎)</span>';
    game.shareText=`קשה באימונים, קל בקרב 💪\nבואו להתאמן על להשתבץ לכוסות חד״פ במסיבת סיום — לי דווקא יצא לתפוס ${data.item.n} לפני כולם 🤯 רוצים לנסות גם?\n${url}`;
  } else {
    $('#resultStamp').textContent=rand(LOSE_STAMP);
    $('#resultTitle').innerHTML=rand(LOSE_TITLE);
    $('#resultSub').innerHTML='נשארו רק אלה. איפה לשבץ אותך? 🤔';
    $('#resultLeft').innerHTML=leftCard(game.absurd,'absurd')+leftCard(VEG,'veg');
    $('#resultBrand').innerHTML=LOSE_BRAND;
    game.shareText=`קשה באימונים, קל בקרב 💪\nבואו להתאמן על להשתבץ לכוסות חד״פ במסיבת סיום — לי יצא להביא ${game.absurd.n}. רוצים לנסות גם?\n${url}`;
  }
  overlay.classList.add('is-open');
  $('#replayFab').hidden=false;
  launchConfetti(kind==='win');
}

/* ================= share / restart ================= */
function share(){ window.open('https://wa.me/?text='+encodeURIComponent(game.shareText||location.href),'_blank','noopener'); }
function restart(){
  clearTimers(); game.over=false; game.result=null; game.won=false;
  overlay.classList.remove('is-open');
  $('#replayFab').hidden=true;
  show('chat');
  playChat();
}

/* ================= confetti ================= */
function launchConfetti(big){
  const cv=$('#confetti'), ctx=cv.getContext('2d'), dpr=window.devicePixelRatio||1;
  cv.width=innerWidth*dpr; cv.height=innerHeight*dpr; ctx.scale(dpr,dpr);
  const colors=['#6FB23C','#4f8f2a','#8fce5a','#161616','#ffffff'];
  const N=big?160:110;
  const parts=Array.from({length:N},()=>({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*0.5,
    r:5+Math.random()*7,c:rand(colors),vx:(Math.random()*2-1)*1.4,vy:2+Math.random()*3.5,rot:Math.random()*6.28,vr:(Math.random()*2-1)*0.2}));
  let f=0;
  (function loop(){ ctx.clearRect(0,0,innerWidth,innerHeight);
    parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr; p.vy+=0.02;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*0.6); ctx.restore(); });
    if(++f<260) requestAnimationFrame(loop); else ctx.clearRect(0,0,innerWidth,innerHeight);
  })();
}

/* ================= audio ================= */
let AC=null, masterGain=null;
function initAudio(){ if(S.audioReady) return;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); masterGain=AC.createGain();
    masterGain.gain.value=S.muted?0:0.5; masterGain.connect(AC.destination); S.audioReady=true; }catch(e){} }
function tone(freq,dur,type='sine',vol=0.3){ if(!S.audioReady||S.muted) return;
  const o=AC.createOscillator(), g=AC.createGain(); o.type=type; o.frequency.value=freq;
  g.gain.setValueAtTime(0,AC.currentTime); g.gain.linearRampToValueAtTime(vol,AC.currentTime+0.01);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+dur); o.connect(g); g.connect(masterGain);
  o.start(); o.stop(AC.currentTime+dur); }
const playPop =()=>tone(520,0.07,'square',0.13);
const playDing=()=>tone(880,0.16,'triangle',0.2);
function playWin(){ [523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'triangle',0.26),i*110)); }
function toggleMute(){ S.muted=!S.muted; const b=$('#muteBtn'); b.textContent=S.muted?'🔇':'🔊'; b.classList.toggle('is-muted',S.muted);
  if(masterGain) masterGain.gain.value=S.muted?0:0.5; }

/* ================= wire up ================= */
overlay.classList.remove('is-open');
$('#replayFab').hidden=true;
$('#skipBtn').addEventListener('click',skipChat);
$('#againBtn').addEventListener('click',restart);
$('#shareBtn').addEventListener('click',share);
$('#closeBtn').addEventListener('click',()=>overlay.classList.remove('is-open'));
$('#replayFab').addEventListener('click',restart);
waHint.addEventListener('click',()=>{ if(linkEl && linkEl.classList.contains('is-live')) startTable(); });
$('#muteBtn').addEventListener('click',()=>{ initAudio(); toggleMute(); });
document.body.addEventListener('pointerdown',initAudio,{once:true});
window.addEventListener('pageshow',e=>{ if(e.persisted) restart(); });
window.addEventListener('resize',()=>{ const cv=$('#confetti'); if(cv){ cv.width=innerWidth; cv.height=innerHeight; } });
playChat();
