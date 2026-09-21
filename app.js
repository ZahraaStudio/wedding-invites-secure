// Public landing page. Templates are generated from a data-driven system.
// 120 choices are available from combinations of style families and layouts.
const families = [
  ["gold","ذهبي","❀"],["rose","وردي","✿"],["green","حدائق","❦"],["blue","أزرق","✧"],
  ["dark","أسود وذهبي","❖"],["lilac","ليلكي","✽"],["pearl","لؤلؤي","❁"],
  ["terracotta","ترابي","❧"],["teal","فيروزي","✦"],["navy","كحلي","❋"]
];
const names = ["Classic","Royal","Floral","Minimal","Luxury","Arabic","Pearl","Garden","Modern","Majestic","Romantic","Elegant"];
const templates = Array.from({length:120},(_,i)=>{
  const f=families[i%families.length], n=names[i%names.length];
  return {id:`tpl-${String(i+1).padStart(3,"0")}`, name:`${n} ${String(i+1).padStart(3,"0")}`, family:f[0], label:f[1], ornament:f[2], premium:i%4===0};
});
window.DAWATY_TEMPLATES=templates;
function renderGallery(){
  const el=document.getElementById("templateGallery"); if(!el)return;
  el.innerHTML=templates.map(t=>`<article class="template-tile ${t.family}-theme"><span class="tbadge">${t.premium?"PREMIUM":"متاح"}</span><div class="floral">${t.ornament}</div><div><div class="tname">${t.name}</div><div class="tguest">أحمد ♡ هاجر</div></div><div>${t.label}</div></article>`).join("");
}
renderGallery();
const y=document.getElementById("year"); if(y)y.textContent=new Date().getFullYear();
