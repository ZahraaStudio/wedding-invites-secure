import * as F from "./firebase.js";
import "./app.js";
const p=new URLSearchParams(location.search),eventId=p.get("event"),token=p.get("token"),preview=p.get("preview");
const root=document.querySelector("#inviteRoot");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
async function run(){
  if(preview&&eventId){const es=await F.getDoc(F.doc(F.db,"publicEvents",eventId));if(!es.exists()||es.data().published===false){root.innerHTML='<div class="loading">المعاينة غير متاحة.</div>';return}render(es.data(),null);return;}
  if(!token){root.innerHTML='<div class="loading">رابط الدعوة غير صحيح.</div>';return}
  const s=await F.getDoc(F.doc(F.db,"publicInvites",token));if(!s.exists()||s.data().published===false){root.innerHTML='<div class="loading">هذا الرابط غير صالح أو تم إيقاف الدعوة.</div>';return}
  const g={id:s.id,...s.data()};
  const analytics={lastViewedAt:F.serverTimestamp(),viewCount:F.increment(1)};
  if(!g.viewed){analytics.viewed=true;analytics.firstViewedAt=F.serverTimestamp();}
  await F.updateDoc(F.doc(F.db,"publicInvites",token),analytics).catch(()=>{});
  await F.updateDoc(F.doc(F.db,"events",g.eventId),{viewCount:F.increment(1)}).catch(()=>{});
  g.viewed=true;g.viewCount=(g.viewCount||0)+1;render(g,g);
}
function render(e,g){
  const family=(window.DAWATY_TEMPLATES||[]).find(x=>x.id===e.templateId)?.family||"gold", d=e.design||{};
  root.innerHTML=`<div class="invite-shell ${family}-theme ${esc(e.templateId||"")}" style="--invite-accent:${esc(d.accent||"#d4af37")};--invite-font:${esc(d.font||"Cairo")}"><article class="invite-card ${esc(d.cardStyle||"classic")}">
    ${e.groomImageUrl||e.brideImageUrl?`<div class="invite-couple-photos">${e.groomImageUrl?`<img src="${esc(e.groomImageUrl)}" alt="العريس">`:""}${e.brideImageUrl?`<img src="${esc(e.brideImageUrl)}" alt="العروسة">`:""}</div>`:""}
    <div class="inv-orn">❦</div><small>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</small><h2>بارك الله لكما<br>وبارك عليكما</h2><p>${esc(e.inviteText||"يتشرفان بدعوتكم لحضور حفل زفافهما")}</p><h1>${esc(e.groomName)} <span class="heart">♡</span> ${esc(e.brideName)}</h1>
    ${g?`<div class="inv-guest">الدعوة مخصصة إلى: <b>${esc(g.name)}</b>${g.table?`<br><span>الطاولة: ${esc(g.table)}</span>`:""}</div>`:"<div class='inv-guest'>معاينة الدعوة</div>"}
    <div class="inv-date">${e.eventDate||""} ${e.eventTime?`• ${e.eventTime}`:""}</div><div class="inv-details"><div class="inv-detail"><small>القاعة</small><b>${esc(e.venue)}</b></div><div class="inv-detail"><small>التاريخ</small><b>${e.eventDate||""}</b></div><div class="inv-detail"><small>الموقع</small>${e.mapUrl?`<a href="${esc(e.mapUrl)}" target="_blank" rel="noopener">فتح الخريطة</a>`:"—"}</div></div>
    ${e.brideHenna||e.groomHenna?`<div class="inv-details"><div class="inv-detail"><small>حنة العروسة</small><b>${e.brideHenna||"—"}</b></div><div class="inv-detail"><small>حنة العريس</small><b>${e.groomHenna||"—"}</b></div></div>`:""}
    ${g?`<div class="qr-area"><div id="qrCode"></div><small>اعرض هذا الكود عند الدخول</small></div><div class="rsvp"><h3>هل ستشرفنا بحضورك؟</h3><button class="btn btn-gold" id="yesBtn">✓ سأحضر</button><button class="btn btn-outline" id="noBtn">أعتذر</button><div id="rsvpBox"></div></div>`:""}
  </article></div>`;
  if(g){loadScript("https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js").then(()=>{new QRCode(document.getElementById("qrCode"),{text:g.token,width:150,height:150,colorDark:d.accent||"#111",colorLight:"#fff"})}).catch(()=>{});document.querySelector("#yesBtn").onclick=()=>rsvp(g,"yes");document.querySelector("#noBtn").onclick=()=>rsvp(g,"no");}
}
async function rsvp(g,status){const box=document.querySelector("#rsvpBox");if(status==="yes"){box.innerHTML=`<div style="margin-top:12px"><label>عدد الأشخاص <select id="party"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label><button class="btn btn-dark btn-sm" id="confirmParty">تأكيد</button></div>`;document.querySelector("#confirmParty").onclick=async()=>saveRsvp(g,"yes",Number(document.querySelector("#party").value));}else await saveRsvp(g,"no",0)}
async function saveRsvp(g,status,n){const old=g.rsvp||"pending";await F.updateDoc(F.doc(F.db,"publicInvites",g.token),{rsvp:status,partySize:n,rsvpAt:F.serverTimestamp()});if(old!=="yes"&&status==="yes")await F.updateDoc(F.doc(F.db,"events",g.eventId),{rsvpCount:F.increment(1)}).catch(()=>{});if(old==="yes"&&status!=="yes")await F.updateDoc(F.doc(F.db,"events",g.eventId),{rsvpCount:F.increment(-1)}).catch(()=>{});document.querySelector("#rsvpBox").innerHTML=status==="yes"?'<p class="success">تم تأكيد حضورك، نتشرف بك ❤️</p>':'<p class="danger">شكرًا لتواصلك، ونأسف لعدم تمكنك من الحضور.</p>';g.rsvp=status;}
run().catch(e=>root.innerHTML=`<div class="loading">تعذر فتح الدعوة: ${esc(e.message)}</div>`);
