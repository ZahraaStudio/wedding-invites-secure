import * as F from "./firebase.js";
import "./app.js";
import config from "./firebase-config-module.js";
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
let clients=[], events=[];
const msg=(id,t,good=false)=>{const e=q("#"+id);if(e){e.textContent=t;e.className="msg "+(good?"success":"");}};
const withTimeout=(promise,ms=15000)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error("انتهت مهلة الاتصال بـ Firebase. تحقق من الإنترنت وإعدادات Firebase ثم حاول مرة أخرى.")),ms))]);
function friendly(e){const code=e?.code||"",text=String(e?.message||"");if(code==="auth/invalid-credential"||code==="auth/wrong-password"||code==="auth/user-not-found")return"بيانات الدخول غير صحيحة.";if(code==="auth/firebase-app-check-token-is-invalid"||code==="auth/app-check-token-is-invalid"||/app.?check.*invalid/i.test(text))return"Firebase App Check يرفض الدومين الحالي. أضف Site Key الصحيح أو عطّل Enforcement لـ Authentication من Firebase Console.";if(code==="auth/network-request-failed")return"تعذر الاتصال بالإنترنت.";if(code==="permission-denied"||/permission.?denied/i.test(text))return"تم الدخول، لكن حساب الإدارة غير مسموح له بقراءة Firestore. أضف مستندًا في admins بنفس UID للحساب.";return text||"حدث خطأ أثناء التحقق."}
async function isAdmin(uid){
  const s=await withTimeout(F.getDoc(F.doc(F.db,"admins",uid))); return s.exists() && s.data().active!==false;
}
F.onAuthStateChanged(F.auth,async user=>{
  if(!user)return;
  try{if(await isAdmin(user.uid))await showAdmin();else{await F.signOut(F.auth);msg("adminMsg","هذا الحساب ليس حساب إدارة. تأكد من وجود مستند admins بنفس UID.");}}
  catch(err){msg("adminMsg",friendly(err));}
});
q("#adminLoginForm")?.addEventListener("submit",async e=>{e.preventDefault();const button=e.currentTarget.querySelector("button[type=submit]");button?.setAttribute("disabled","disabled");msg("adminMsg","جاري التحقق...");try{await withTimeout(F.signInWithEmailAndPassword(F.auth,q("#adminEmail").value.trim().toLowerCase(),q("#adminPassword").value));}catch(err){msg("adminMsg",friendly(err))}finally{button?.removeAttribute("disabled")}});
q("#adminLogout")?.addEventListener("click",async()=>{await F.signOut(F.auth);location.reload()});
async function showAdmin(){await loadAll();q("#adminGate").classList.add("hidden");q("#adminPanel").classList.remove("hidden");q("#newClientBtn").onclick=()=>openForm();q("#cancelClient").onclick=()=>q("#clientForm").classList.add("hidden");q("#clientForm").onsubmit=saveClient;q("#clientSearch").oninput=()=>renderClients(q("#clientSearch").value)}
async function loadAll(){
  const cs=await withTimeout(F.getDocs(F.collection(F.db,"clients")));clients=cs.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.role!=="admin");
  const es=await withTimeout(F.getDocs(F.collection(F.db,"events")));events=es.docs.map(d=>({id:d.id,...d.data()}));
  q("#statClients").textContent=clients.length;q("#statEvents").textContent=events.length;q("#statGuests").textContent=events.reduce((n,e)=>n+(e.guestCount||0),0);q("#statViews").textContent=events.reduce((n,e)=>n+(e.viewCount||0),0);renderClients();
}
function renderClients(term=""){
  const t=term.toLowerCase();const rows=clients.filter(c=>(c.name||"").toLowerCase().includes(t)||(c.email||"").toLowerCase().includes(t));
  q("#clientsTable").innerHTML=rows.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${c.guestLimit||0}</td><td>${c.expiresAt||"غير محدد"}</td><td>${c.active===false?"متوقف":"فعال"}</td><td><button class="btn btn-outline btn-sm" data-edit="${c.id}">تعديل</button></td></tr>`).join("")||`<tr><td colspan="6">لا يوجد عملاء.</td></tr>`;
  qa("[data-edit]").forEach(b=>b.onclick=()=>openForm(clients.find(c=>c.id===b.dataset.edit)));
}
function openForm(c=null){q("#clientForm").classList.remove("hidden");q("#clientId").value=c?.id||"";q("#clientName").value=c?.name||"";q("#clientEmail").value=c?.email||"";q("#clientPassword").value="";q("#guestLimit").value=c?.guestLimit||500;q("#expiresAt").value=c?.expiresAt||"";q("#clientActive").checked=c?.active!==false;window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})}
async function saveClient(e){
  e.preventDefault();const id=q("#clientId").value,email=q("#clientEmail").value.trim(),password=q("#clientPassword").value;
  try{
    if(!id){
      if(password.length<6)throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف.");
      const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(config.apiKey)}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password,returnSecureToken:true})
      });
      const out = await r.json();
      if(!r.ok) throw new Error(out?.error?.message==="EMAIL_EXISTS"?"هذا البريد مستخدم بالفعل.":out?.error?.message||"تعذر إنشاء حساب Firebase.");
      await F.setDoc(F.doc(F.db,"clients",out.localId),{
        name:q("#clientName").value.trim(),email,role:"client",active:q("#clientActive").checked,
        guestLimit:Number(q("#guestLimit").value),expiresAt:q("#expiresAt").value||null,
        createdAt:F.serverTimestamp(),updatedAt:F.serverTimestamp()
      });
      msg("clientMsg","تم إنشاء حساب العميل بنجاح. أرسل له البريد وكلمة المرور.",true);
      q("#clientForm").classList.add("hidden");
      await loadAll();
      return;
    }
    await F.updateDoc(F.doc(F.db,"clients",id),{name:q("#clientName").value.trim(),guestLimit:Number(q("#guestLimit").value),expiresAt:q("#expiresAt").value||null,active:q("#clientActive").checked,updatedAt:F.serverTimestamp()});
    msg("clientMsg","تم تحديث العميل.",true);q("#clientForm").classList.add("hidden");await loadAll();
  }catch(err){msg("clientMsg",err.message||"حدث خطأ")}
}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
