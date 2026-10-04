
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const saveKey="neneworldPlayableHouseV2";
let state=JSON.parse(localStorage.getItem(saveKey)||'{}');

state.sound ??= true;
state.bag ??= [];
state.characters ??= {
  Nene:{x:34,y:52},
  Yuna:{x:48,y:54},
  Natalie:{x:60,y:54}
};
state.room ??= "kitchen";
state.fridgeOpen ??= false;
state.sleeping ??= false;
state.petMood ??= "happy";

let soundOn=state.sound;

const data={
 family:{title:"Family House",sub:"Enter the house and play.",img:"home-title.jpg",actions:["🏠 Enter House","👨‍👩‍👧 Family","🐩 Snowy","🐕 Coco"]},
 school:{title:"School",sub:"Go to class and make friends.",img:"choose-location.jpg",actions:["🎒 Go to Class","📚 Read","✏️ Draw","🙋 Raise Hand"]},
 cafe:{title:"Pet Café",sub:"Play with pets and enjoy treats.",img:"choose-location.jpg",actions:["🐩 Pet Snowy","🐕 Pet Coco","🥣 Feed","🎾 Play"]},
 grocery:{title:"Grocery Store",sub:"Pick food and groceries.",img:"choose-location.jpg",actions:["🛒 Shop","🍎 Pick Apple","🥛 Get Milk","🎒 Put in Bag"]},
 playground:{title:"Playground",sub:"Play outside.",img:"choose-location.jpg",actions:["🛝 Slide","⚽ Ball","🌳 Explore","🧺 Picnic"]},
 city:{title:"City",sub:"Explore NeneWorld.",img:"choose-location.jpg",actions:["🏙️ Walk","🛍️ Shop","🍦 Ice Cream","🚗 Drive"]},
 kitchen:{title:"Kitchen & Living Room",sub:"Drag the girls, open the fridge, eat and play.",img:"kitchen-living.jpg"},
 bedroom:{title:"Bedroom",sub:"Drag characters onto the bed and tap Sleep.",img:"bedroom.jpg"},
 bathroom:{title:"Bathroom",sub:"Brush teeth, wash and get ready.",img:"bathroom.jpg"},
 dress:{title:"Dress Up",sub:"Choose clothes and create your look.",img:"dress-up.jpg",actions:["👚 Tops","👗 Dresses","👖 Bottoms","👟 Shoes","🎀 Accessories"]},
 interact:{title:"Interact & Play",sub:"Eat, sit, sleep, play and give.",img:"interact-play.jpg",actions:["🍴 Eat","🪑 Sit","🛏️ Sleep","🎮 Play","💗 Give"]},
 cabinets:{title:"Cabinets & Objects",sub:"Open the fridge and move food into your backpack.",img:"cabinets.jpg"},
 sleep:{title:"Sleep Time",sub:"Good night, NeneWorld.",img:"sleep-time.jpg"}
};

function beep(f=650,d=.06){
  if(!soundOn)return;
  try{
    const A=window.AudioContext||window.webkitAudioContext,c=new A,o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.frequency.value=f;g.gain.value=.025;o.start();
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);o.stop(c.currentTime+d)
  }catch(e){}
}
function toast(t){
  let x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1600)
}
function saveWorld(show=true){
  state.sound=soundOn;
  localStorage.setItem(saveKey,JSON.stringify(state));
  if(show)toast("☁️ NeneWorld saved!");
  beep(820)
}
function back(){
  $("#detailScreen").classList.remove("active");
  $("#mainScreen").classList.add("active");
  window.scrollTo(0,0)
}
function openView(name){
  const d=data[name]; if(!d)return;
  $("#mainScreen").classList.remove("active");
  $("#detailScreen").classList.add("active");
  $("#detailTitle").textContent=d.title;
  $("#detailSubtitle").textContent=d.sub;
  $("#detailImage").src="assets/"+d.img;
  $("#detailImage").alt=d.title;
  $("#detailInteractive").innerHTML="";
  $("#actionBar").innerHTML="";

  if(name==="kitchen") setupKitchen();
  else if(name==="bedroom") setupBedroom();
  else if(name==="bathroom") setupBathroom();
  else if(name==="cabinets") setupCabinets();
  else if(name==="sleep") setupSleep();
  else if(name==="family") setupFamilyMenu();
  else makeActions(d.actions||["✨ Explore","💗 Play"]);
  window.scrollTo(0,0);
  beep(620)
}
function makeActions(list){
  $("#actionBar").innerHTML=list.map(a=>`<button class="action">${a}</button>`).join("");
  $$("#actionBar .action").forEach(b=>b.onclick=()=>{toast(b.textContent+"!");beep(730)})
}

function drag(el,area,name){
  let down=false,ox=0,oy=0;
  el.addEventListener("pointerdown",e=>{
    down=true;el.setPointerCapture(e.pointerId);
    let r=el.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;
    el.style.zIndex=40;
  });
  el.addEventListener("pointermove",e=>{
    if(!down)return;
    let a=area.getBoundingClientRect();
    let x=e.clientX-a.left-ox,y=e.clientY-a.top-oy;
    x=Math.max(0,Math.min(a.width-el.offsetWidth,x));
    y=Math.max(0,Math.min(a.height-el.offsetHeight,y));
    el.style.left=x+"px";el.style.top=y+"px";
  });
  el.addEventListener("pointerup",()=>{
    down=false;el.style.zIndex=10;
    let a=area.getBoundingClientRect(),r=el.getBoundingClientRect();
    state.characters[name]={x:((r.left-a.left)/a.width)*100,y:((r.top-a.top)/a.height)*100};
    saveWorld(false)
  });
}

function addCharacter(name,emoji){
  const area=$("#detailInteractive");
  const pos=state.characters[name]||{x:35,y:50};
  let el=document.createElement("div");
  el.className="draggable";
  el.innerHTML=`${emoji}<span class="name-tag">${name}</span>`;
  el.style.left=pos.x+"%"; el.style.top=pos.y+"%";
  area.appendChild(el); drag(el,area,name);
}

function setupFamilyMenu(){
  $("#actionBar").innerHTML=`
    <button class="action" data-house="kitchen">🍳 Kitchen & Living</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>
    <button class="action" data-house="bathroom">🛁 Bathroom</button>
    <button class="action" data-house="cabinets">🧊 Fridge & Cabinets</button>`;
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

function setupKitchen(){
  addCharacter("Nene","👧🏻");
  addCharacter("Yuna","👧🏽");
  addCharacter("Natalie","👧🏼");

  const area=$("#detailInteractive");

  let snowy=document.createElement("div");
  snowy.className="pet-marker"; snowy.textContent="🐩";
  snowy.style.left="70%"; snowy.style.top="70%";
  snowy.onclick=()=>{state.petMood="happy";toast("Snowy is happy! 💗");beep(790)};
  area.appendChild(snowy);

  let coco=document.createElement("div");
  coco.className="pet-marker"; coco.textContent="🐕";
  coco.style.left="82%"; coco.style.top="71%";
  coco.onclick=()=>{state.petMood="happy";toast("Coco wants to play! 🎾");beep(760)};
  area.appendChild(coco);

  $("#actionBar").innerHTML=`
    <button class="action" id="eatBtn">🍴 Eat</button>
    <button class="action" id="sitBtn">🪑 Sit</button>
    <button class="action" id="playBtn">🎮 Play</button>
    <button class="action" id="giveBtn">💗 Give Treat</button>
    <button class="action" id="fridgeBtn">🧊 Open Fridge</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>`;

  $("#eatBtn").onclick=()=>consumeFood();
  $("#sitBtn").onclick=()=>toast("Nene sits at the table. 🪑");
  $("#playBtn").onclick=()=>toast("Play time! 🎮");
  $("#giveBtn").onclick=()=>{toast("Snowy and Coco got a treat! 🐩🐕");state.petMood="excited";saveWorld(false)};
  $("#fridgeBtn").onclick=()=>openView("cabinets");
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

function consumeFood(){
  if(state.bag.length){
    let foodIndex=state.bag.findIndex(i=>["🍎","🥛","🥕","🍰","🍕","🧃"].includes(i));
    if(foodIndex>=0){
      let item=state.bag.splice(foodIndex,1)[0];
      toast(`Nene ate ${item} Yum!`);
      saveWorld(false);beep(840);return;
    }
  }
  toast("Pick food from the fridge first! 🧊");
}

function setupBedroom(){
  addCharacter("Nene","👧🏻");
  addCharacter("Yuna","👧🏽");
  addCharacter("Natalie","👧🏼");
  const area=$("#detailInteractive");

  if(state.sleeping){
    let moon=document.createElement("div");
    moon.className="sleep-overlay";
    moon.innerHTML="🌙 <span>Z z z</span>";
    area.appendChild(moon);
  }
  $("#actionBar").innerHTML=`
    <button class="action" id="sleepBtn">${state.sleeping?"☀️ Wake Up":"🌙 Sleep"}</button>
    <button class="action">🧸 Play</button>
    <button class="action" data-house="kitchen">🍳 Kitchen</button>
    <button class="action" data-house="bathroom">🛁 Bathroom</button>`;
  $("#sleepBtn").onclick=()=>{
    state.sleeping=!state.sleeping;saveWorld(false);
    toast(state.sleeping?"Good night! 🌙":"Good morning! ☀️");
    setupBedroom()
  };
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

function setupBathroom(){
  addCharacter("Yuna","👧🏽");
  $("#actionBar").innerHTML=`
    <button class="action">🪥 Brush Teeth</button>
    <button class="action">🛁 Take Bath</button>
    <button class="action">🧼 Wash Hands</button>
    <button class="action">🪞 Get Ready</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>`;
  $$("#actionBar .action").forEach(b=>{
    if(!b.dataset.house)b.onclick=()=>{toast(b.textContent+"! ✨");beep(740)}
  });
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

function setupCabinets(){
  const area=$("#detailInteractive");
  const foods=[
    ["🍎","42%","44%"],["🥛","53%","36%"],["🥕","63%","48%"],["🍰","58%","63%"],["🍕","47%","62%"],["🧃","68%","36%"]
  ];
  foods.forEach(([em,l,t])=>{
    let e=document.createElement("div");
    e.className="food-item"; e.textContent=em; e.style.left=l; e.style.top=t;
    if(state.bag.includes(em))e.classList.add("picked");
    e.onclick=()=>{
      if(state.bag.includes(em)){
        state.bag.splice(state.bag.indexOf(em),1);
        toast(`${em} put back in fridge`);
      }else if(state.bag.length<8){
        state.bag.push(em); toast(`${em} added to backpack 🎒`);
      }else toast("Backpack is full!");
      saveWorld(false);setupCabinets()
    };
    area.appendChild(e)
  });

  $("#actionBar").innerHTML=`
    <button class="action" id="bagBtn">🎒 Backpack (${state.bag.length}/8)</button>
    <button class="action" data-house="kitchen">🍳 Kitchen</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>`;
  $("#bagBtn").onclick=()=>toast(state.bag.length?`In bag: ${state.bag.join(" ")}`:"Your backpack is empty");
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

function setupSleep(){
  state.sleeping=true;saveWorld(false);
  $("#actionBar").innerHTML=`
    <button class="action" id="wakeBtn">☀️ Wake Up</button>
    <button class="action">🧸 Hug Teddy</button>
    <button class="action">🐩 Hug Snowy</button>
    <button class="action">🐕 Hug Coco</button>`;
  $("#wakeBtn").onclick=()=>{state.sleeping=false;saveWorld(false);openView("bedroom")};
  $$("#actionBar .action").slice(1).forEach(b=>b.onclick=()=>toast(b.textContent+" 💗"))
}

$$(".hotspot").forEach(b=>b.onclick=()=>openView(b.dataset.view));
$("#backBtn").onclick=back;

// Make Family House hotspot go directly to playable kitchen.
const familyHot=$(".hs-family");
if(familyHot) familyHot.onclick=()=>openView("kitchen");
const kitchenHot=$(".hs-kitchen");
if(kitchenHot) kitchenHot.onclick=()=>openView("kitchen");
const bedroomHot=$(".hs-bedroom");
if(bedroomHot) bedroomHot.onclick=()=>openView("bedroom");
const bathroomHot=$(".hs-bathroom");
if(bathroomHot) bathroomHot.onclick=()=>openView("bathroom");
const cabinetsHot=$(".hs-cabinets");
if(cabinetsHot) cabinetsHot.onclick=()=>openView("cabinets");
const sleepHot=$(".hs-sleep");
if(sleepHot) sleepHot.onclick=()=>openView("sleep");

// mobile scaling
function fit(){
  if(innerWidth<=800){
    const shell=document.querySelector(".art-shell");
    const scale=innerWidth/1536;
    shell.style.transform=`scale(${scale})`;
    shell.style.marginBottom=`${-(1024*(1-scale))}px`;
  }else{
    const shell=document.querySelector(".art-shell");
    shell.style.transform="";
    shell.style.marginBottom="";
  }
}
addEventListener("resize",fit);fit();

// ===== Character Creator v3 =====
state.looks ??= {
  Nene:{hair:"black",hairStyle:"long",tone:"2",top:"pink",bottom:"skirt",shoes:"👟 👟",accessory:"🎀"},
  Yuna:{hair:"brown",hairStyle:"wavy",tone:"2",top:"purple",bottom:"purpleskirt",shoes:"👟 👟",accessory:"💜"},
  Natalie:{hair:"blonde",hairStyle:"long",tone:"1",top:"pink",bottom:"skirt",shoes:"👠 👠",accessory:"🎀"}
};
state.activeCharacter ??= "Nene";

const ccData={
 hair:[
   {label:"Long Black",icon:"🖤",hair:"black",hairStyle:"long"},
   {label:"Wavy Brown",icon:"🤎",hair:"brown",hairStyle:"wavy"},
   {label:"Blonde",icon:"💛",hair:"blonde",hairStyle:"long"},
   {label:"Bob",icon:"✂️",hair:"black",hairStyle:"bob"},
   {label:"Ponytail",icon:"🎀",hair:"brown",hairStyle:"ponytail"},
   {label:"Pink Hair",icon:"💗",hair:"pinkhair",hairStyle:"long"}
 ],
 skin:[
   {label:"Light",icon:"🤍",tone:"1"},{label:"Warm",icon:"🧡",tone:"2"},
   {label:"Tan",icon:"🤎",tone:"3"},{label:"Deep",icon:"🤎",tone:"4"}
 ],
 top:[
   {label:"Pink",icon:"💗",top:"pink"},{label:"Purple",icon:"💜",top:"purple"},
   {label:"Blue",icon:"💙",top:"blue"},{label:"Black",icon:"🖤",top:"blacktop"},{label:"Mint",icon:"💚",top:"mint"}
 ],
 bottom:[
   {label:"Pink Skirt",icon:"👗",bottom:"skirt"},{label:"Purple Skirt",icon:"💜",bottom:"purpleskirt"},
   {label:"Jeans",icon:"👖",bottom:"jeans"},{label:"Shorts",icon:"🩳",bottom:"shorts"}
 ],
 shoes:[
   {label:"Sneakers",icon:"👟",shoes:"👟 👟"},{label:"Heels",icon:"👠",shoes:"👠 👠"},
   {label:"Boots",icon:"🥾",shoes:"🥾 🥾"},{label:"Flats",icon:"🥿",shoes:"🥿 🥿"}
 ],
 accessory:[
   {label:"Bow",icon:"🎀",accessory:"🎀"},{label:"Heart",icon:"💗",accessory:"💗"},
   {label:"Flower",icon:"🌸",accessory:"🌸"},{label:"Star",icon:"⭐",accessory:"⭐"},{label:"None",icon:"✖️",accessory:""}
 ]
};
let ccCat="hair";
let ccWorking={...state.looks[state.activeCharacter]};

function openCreator(){
  $("#mainScreen").classList.remove("active");
  $("#detailScreen").classList.remove("active");
  $("#creatorScreen").classList.add("active");
  $("#ccCharacter").value=state.activeCharacter;
  $("#ccName").value=state.activeCharacter;
  ccWorking={...state.looks[state.activeCharacter]};
  renderCreator();
  window.scrollTo(0,0);
}
function closeCreator(){
  $("#creatorScreen").classList.remove("active");
  $("#mainScreen").classList.add("active");
}
function renderCreator(){
  $("#ccHair").className=`avatar-hair ${ccWorking.hairStyle||"long"} ${ccWorking.hair||"black"}`;
  $("#ccHead").className=`avatar-head tone${ccWorking.tone||"2"}`;
  $("#ccTop").className=`avatar-topwear ${ccWorking.top||"pink"}`;
  $("#ccBottom").className=`avatar-bottomwear ${ccWorking.bottom||"skirt"}`;
  $("#ccShoes").textContent=ccWorking.shoes||"👟 👟";
  $("#ccAccessory").textContent=ccWorking.accessory||"";
  $("#ccGrid").innerHTML=ccData[ccCat].map((o,i)=>`<button class="cc-option" data-i="${i}">${o.icon}<small>${o.label}</small></button>`).join("");
  $$("#ccGrid .cc-option").forEach(b=>b.onclick=()=>{
    Object.assign(ccWorking,ccData[ccCat][+b.dataset.i]);renderCreator();beep(760)
  })
}
$$(".cc-tabs button").forEach(b=>b.onclick=()=>{
  ccCat=b.dataset.cat;$$(".cc-tabs button").forEach(x=>x.classList.toggle("active",x===b));renderCreator()
});
$("#ccCharacter").onchange=e=>{
  let n=e.target.value;
  if(n==="New Character"){
    n="New Character";
    ccWorking={hair:"black",hairStyle:"long",tone:"2",top:"pink",bottom:"skirt",shoes:"👟 👟",accessory:"🎀"};
  }else{
    state.activeCharacter=n;ccWorking={...state.looks[n]};$("#ccName").value=n;
  }
  renderCreator()
};
$("#randomizeBtn").onclick=()=>{
  const rand=a=>a[Math.floor(Math.random()*a.length)];
  ccWorking={...ccWorking,...rand(ccData.hair),...rand(ccData.skin),...rand(ccData.top),...rand(ccData.bottom),...rand(ccData.shoes),...rand(ccData.accessory)};
  renderCreator();beep(820)
};
$("#saveLookBtn").onclick=()=>{
  let name=$("#ccName").value.trim()||"New Character";
  state.looks[name]={...ccWorking};
  state.activeCharacter=name;
  saveWorld(false);
  toast(`${name}'s look saved! 💾`);
  // add custom name to select once
  if(![...$("#ccCharacter").options].some(o=>o.value===name)){
    let opt=document.createElement("option");opt.value=name;opt.textContent=name;$("#ccCharacter").appendChild(opt)
  }
  $("#ccCharacter").value=name;
};
$("#wearInHouseBtn").onclick=()=>{
  let name=$("#ccName").value.trim()||state.activeCharacter;
  state.looks[name]={...ccWorking};state.activeCharacter=name;saveWorld(false);
  toast(`${name} will wear this in the house! 🏡`);
};
$("#creatorBack").onclick=closeCreator;

// Redirect Dress Up to creator
const dressHot=$(".hs-dress");
if(dressHot)dressHot.onclick=()=>openCreator();

// Add creator button to dress detail if reached through other flows
const oldOpenView=openView;
openView=function(name){
  if(name==="dress"){openCreator();return}
  oldOpenView(name)
};

// Render active character look in house as layered mini avatar
function addStyledCharacter(name,leftPct,topPct){
  const area=$("#detailInteractive"),look=state.looks[name]||state.looks.Nene;
  let wrap=document.createElement("div");
  wrap.className="mini-avatar draggable";
  wrap.style.left=leftPct+"%";wrap.style.top=topPct+"%";
  wrap.innerHTML=`
    <div class="mini-hair ${look.hairStyle||"long"} ${look.hair||"black"}"></div>
    <div class="mini-head tone${look.tone||"2"}">• •<span>⌣</span></div>
    <div class="mini-top ${look.top||"pink"}"></div>
    <div class="mini-bottom ${look.bottom||"skirt"}"></div>
    <div class="mini-shoes">${look.shoes||"👟 👟"}</div>
    <div class="mini-acc">${look.accessory||""}</div>
    <span class="name-tag">${name}</span>`;
  area.appendChild(wrap);drag(wrap,area,name);
}

const _oldSetupKitchen=setupKitchen;
setupKitchen=function(){
  $("#detailInteractive").innerHTML="";
  const p1=state.characters.Nene||{x:34,y:52},p2=state.characters.Yuna||{x:48,y:54},p3=state.characters.Natalie||{x:60,y:54};
  addStyledCharacter("Nene",p1.x,p1.y);
  addStyledCharacter("Yuna",p2.x,p2.y);
  addStyledCharacter("Natalie",p3.x,p3.y);

  const area=$("#detailInteractive");
  let snowy=document.createElement("div");snowy.className="pet-marker";snowy.textContent="🐩";snowy.style.left="70%";snowy.style.top="70%";snowy.onclick=()=>toast("Snowy is happy! 💗");area.appendChild(snowy);
  let coco=document.createElement("div");coco.className="pet-marker";coco.textContent="🐕";coco.style.left="82%";coco.style.top="71%";coco.onclick=()=>toast("Coco wants to play! 🎾");area.appendChild(coco);

  $("#actionBar").innerHTML=`
    <button class="action" id="eatBtn">🍴 Eat</button>
    <button class="action" id="dressBtn">👗 Dress Up</button>
    <button class="action" id="giveBtn">💗 Give Treat</button>
    <button class="action" id="fridgeBtn">🧊 Open Fridge</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>`;
  $("#eatBtn").onclick=()=>consumeFood();
  $("#dressBtn").onclick=()=>openCreator();
  $("#giveBtn").onclick=()=>toast("Snowy and Coco got a treat! 🐩🐕");
  $("#fridgeBtn").onclick=()=>openView("cabinets");
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}
setupBedroom=function(){
  $("#detailInteractive").innerHTML="";
  const p1=state.characters.Nene||{x:34,y:52},p2=state.characters.Yuna||{x:48,y:54},p3=state.characters.Natalie||{x:60,y:54};
  addStyledCharacter("Nene",p1.x,p1.y);addStyledCharacter("Yuna",p2.x,p2.y);addStyledCharacter("Natalie",p3.x,p3.y);
  if(state.sleeping){let moon=document.createElement("div");moon.className="sleep-overlay";moon.innerHTML="🌙 <span>Z z z</span>";$("#detailInteractive").appendChild(moon)}
  $("#actionBar").innerHTML=`
    <button class="action" id="sleepBtn">${state.sleeping?"☀️ Wake Up":"🌙 Sleep"}</button>
    <button class="action" id="dressBtn2">👗 Dress Up</button>
    <button class="action" data-house="kitchen">🍳 Kitchen</button>
    <button class="action" data-house="bathroom">🛁 Bathroom</button>`;
  $("#sleepBtn").onclick=()=>{state.sleeping=!state.sleeping;saveWorld(false);setupBedroom()};
  $("#dressBtn2").onclick=()=>openCreator();
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}
setupBathroom=function(){
  $("#detailInteractive").innerHTML="";
  const p=state.characters.Yuna||{x:45,y:45};addStyledCharacter("Yuna",p.x,p.y);
  $("#actionBar").innerHTML=`
    <button class="action">🪥 Brush Teeth</button><button class="action">🛁 Take Bath</button>
    <button class="action">🧼 Wash Hands</button><button class="action" id="dressBtn3">👗 Dress Up</button>
    <button class="action" data-house="bedroom">🛏️ Bedroom</button>`;
  $$("#actionBar .action").forEach(b=>{if(!b.dataset.house && b.id!=="dressBtn3")b.onclick=()=>toast(b.textContent+"! ✨")});
  $("#dressBtn3").onclick=()=>openCreator();
  $$("[data-house]").forEach(b=>b.onclick=()=>openView(b.dataset.house))
}

// ===== City Map + Cars v4 =====
state.car ??= "🚗";
state.carName ??= "Pink Car";
state.lastDestination ??= "house";
const cityPositions={
  house:{left:"11%",top:"51%"}, school:{left:"44%",top:"43%"}, cafe:{left:"72%",top:"49%"},
  grocery:{left:"16%",top:"69%"}, playground:{left:"52%",top:"65%"}, clothes:{left:"76%",top:"67%"}
};
function openCity(){
  $("#mainScreen").classList.remove("active");$("#detailScreen").classList.remove("active");$("#creatorScreen").classList.remove("active");
  $("#cityScreen").classList.add("active");$("#cityCar").textContent=state.car;updateGarageSelection();window.scrollTo(0,0);beep(610)
}
function closeCity(){ $("#cityScreen").classList.remove("active");$("#mainScreen").classList.add("active");window.scrollTo(0,0) }
function updateGarageSelection(){ $$("[data-car]").forEach(b=>b.classList.toggle("active",b.dataset.car===state.car)) }
function driveTo(dest,enterAfter=false){
  const p=cityPositions[dest]; if(!p)return;
  $("#cityCar").style.left=p.left;$("#cityCar").style.top=p.top;state.lastDestination=dest;saveWorld(false);
  const names={house:"Family House",school:"School",cafe:"Pet Café",grocery:"Grocery Store",playground:"Playground",clothes:"Clothing Store"};
  $("#driveStatus").textContent=`Driving ${state.carName} to ${names[dest]}...`;beep(520);
  setTimeout(()=>{ $("#driveStatus").textContent=`Arrived at ${names[dest]}!`;toast(`Arrived at ${names[dest]}! 🚗`);if(enterAfter)setTimeout(()=>enterDestination(dest),350) },1200)
}
function enterDestination(dest){
  $("#cityScreen").classList.remove("active");
  if(dest==="house"){openView("kitchen");return}
  if(dest==="school"){openView("school");return}
  if(dest==="cafe"){openView("cafe");return}
  if(dest==="grocery"){openView("grocery");return}
  if(dest==="playground"){openView("playground");return}
  if(dest==="clothes"){openCreator();return}
}
$$("[data-car]").forEach(b=>b.onclick=()=>{ state.car=b.dataset.car;state.carName=b.dataset.carname;$("#cityCar").textContent=state.car;updateGarageSelection();saveWorld(false);toast(`${state.carName} selected!`) });
$$("[data-dest]").forEach(b=>b.onclick=()=>driveTo(b.dataset.dest,true));
$("#driveHome").onclick=()=>driveTo("house",true);$("#driveSchool").onclick=()=>driveTo("school",true);$("#driveCafe").onclick=()=>driveTo("cafe",true);$("#cityBack").onclick=closeCity;
const cityHot=$(".hs-city"); if(cityHot)cityHot.onclick=()=>openCity();
const _v4OldOpenView=openView;
openView=function(name){ if(name==="city"){openCity();return} _v4OldOpenView(name) };
