(function(){
var PAL=['#2F7F6F','#E0A030','#C0503A','#4A6FA5','#8C5E9E','#7BA043','#D17B9B','#5C6B73','#B88A5A','#2BA3B8'];
var DEF={expense:['Food','Transport','Bills','Shopping','Health','Rent'],income:['Salary','Gift','Other']};
function load(k,d){try{var v=localStorage.getItem('batwa_'+k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem('batwa_'+k,JSON.stringify(v))}catch(e){}}
var S={tx:load('tx',[]),cats:load('cats',DEF),loans:load('loans',[]),set:load('set',{on:false,time:'20:00',last:''})};
var V={tab:'home',per:'month',type:'expense',d:new Date()};
function persist(){save('tx',S.tx);save('cats',S.cats);save('loans',S.loans);save('set',S.set)}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function money(n){return '₹'+Math.abs(n).toLocaleString('en-IN',{maximumFractionDigits:2})}
function iso(d){var p=function(n){return(n<10?'0':'')+n};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function mkey(s){return s.slice(0,7)}
var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
function inPeriod(t){var k=iso(V.d);return V.per==='day'?t.date===k:mkey(t.date)===mkey(k)}
function daysIn(d){return new Date(d.getFullYear(),d.getMonth()+1,0).getDate()}
function avgMonthly(type){var m={};S.tx.forEach(function(t){if(t.type===type)m[mkey(t.date)]=(m[mkey(t.date)]||0)+t.amt});
 var cur=mkey(iso(V.d));var ks=Object.keys(m).filter(function(k){return k!==cur});
 if(!ks.length)return null;return ks.reduce(function(a,k){return a+m[k]},0)/ks.length}
function pie(items,total){
 if(!items.length)return '<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="55" fill="none" stroke="var(--line)" stroke-width="26"/></svg>';
 var r=55,C=2*Math.PI*r,off=0,out='<svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Pie chart"><g transform="rotate(-90 75 75)">';
 items.forEach(function(it,i){var len=it.v/total*C;out+='<circle cx="75" cy="75" r="'+r+'" fill="none" stroke="'+PAL[i%PAL.length]+'" stroke-width="26" stroke-dasharray="'+len+' '+(C-len)+'" stroke-dashoffset="'+(-off)+'"/>';off+=len});
 return out+'</g></svg>'}
function home(){
 var d=V.d,list=S.tx.filter(function(t){return inPeriod(t)}).sort(function(a,b){return b.id-a.id});
 var tot={expense:0,income:0},by={};
 list.forEach(function(t){tot[t.type]+=t.amt;if(t.type===V.type)by[t.cat]=(by[t.cat]||0)+t.amt});
 var items=Object.keys(by).map(function(k){return{k:k,v:by[k]}}).sort(function(a,b){return b.v-a.v});
 var cur=tot[V.type],label=V.per==='day'?d.getDate()+' '+MN[d.getMonth()].slice(0,3)+' '+d.getFullYear():MN[d.getMonth()]+' '+d.getFullYear();
 var avg=avgMonthly(V.type),cmp='';
 if(avg===null)cmp='<span class="mute">Not enough past months yet to compare with your average.</span>';
 else{var base=V.per==='day'?avg/daysIn(d):avg,diff=cur-base,w=V.type==='expense'?'spent':'received',
  more=diff>0,good=(V.type==='expense')?!more:more;
  cmp='<span class="tag" style="color:var(--'+(good?'inc':'exp')+')">'+(diff===0?'Same as':money(diff)+(more?' more than':' less than'))+' average</span> <span class="mute">Avg '+(V.per==='day'?'daily':'monthly')+' '+(V.type==='expense'?'spend':'income')+': '+money(base)+'</span>'}
 var h='<div class="seg"><button data-per="day" class="'+(V.per==='day'?'on':'')+'">Daily</button><button data-per="month" class="'+(V.per==='month'?'on':'')+'">Monthly</button></div>';
 h+='<div class="nav"><button data-nav="-1" aria-label="Previous">‹</button><b>'+label+'</b><button data-nav="1" aria-label="Next">›</button></div>';
 h+='<div class="card" style="display:flex;justify-content:space-around;text-align:center"><div><div class="mute">Spent</div><div class="big exp">'+money(tot.expense)+'</div></div><div><div class="mute">Received</div><div class="big inc">'+money(tot.income)+'</div></div></div>';
 h+='<div class="seg"><button data-type="expense" class="'+(V.type==='expense'?'on':'')+'">Expenses</button><button data-type="income" class="'+(V.type==='income'?'on':'')+'">Income</button></div>';
 h+='<div class="card"><div class="pie">'+pie(items,cur)+'<div class="leg">'+(items.length?items.map(function(it,i){return '<div><span class="dot" style="background:'+PAL[i%PAL.length]+'"></span><span style="flex:1">'+esc(it.k)+'</span><b>'+Math.round(it.v/cur*100)+'%</b></div>'}).join(''):'<div class="mute">No '+V.type+' entries for this '+V.per+'.</div>')+'</div></div><div style="margin-top:10px">'+cmp+'</div></div>';
 h+='<h2>Entries</h2><div class="card">'+(list.length?list.map(function(t){return '<div class="row"><div>'+esc(t.cat)+'<small>'+t.date+(t.note?' · '+esc(t.note):'')+'</small></div><div><b class="'+(t.type==='expense'?'exp':'inc')+'">'+(t.type==='expense'?'−':'+')+money(t.amt)+'</b><button class="x" data-deltx="'+t.id+'" aria-label="Delete entry">✕</button></div></div>'}).join(''):'<div class="empty">Nothing here yet. Tap + to add an entry.</div>')+'</div>';
 return h}
function loans(){
 var lent=0,bor=0;S.loans.forEach(function(l){l.dir==='lent'?lent+=l.amt:bor+=l.amt});
 var h='<div class="card" style="display:flex;justify-content:space-around;text-align:center"><div><div class="mute">Others owe you</div><div class="big inc">'+money(lent)+'</div></div><div><div class="mute">You owe</div><div class="big exp">'+money(bor)+'</div></div></div>';
 h+='<button class="btn" id="addloan" style="margin-bottom:12px">Add loan</button><div class="card">';
 h+=S.loans.length?S.loans.slice().reverse().map(function(l){return '<div class="row"><div>'+esc(l.name)+'<small>'+(l.dir==='lent'?'Lent to them':'Borrowed from them')+' · '+l.date+(l.note?' · '+esc(l.note):'')+'</small></div><div><b class="'+(l.dir==='lent'?'inc':'exp')+'">'+money(l.amt)+'</b><button class="x" data-delloan="'+l.id+'" aria-label="Delete loan">✕</button></div></div>'}).join(''):'<div class="empty">No loans. Add one when you lend or borrow money.</div>';
 return h+'</div>'}
function cats(){
 var h='';['expense','income'].forEach(function(t){
  h+='<div class="card"><h2>'+(t==='expense'?'Expense':'Income')+' categories</h2><div class="chips">'+S.cats[t].map(function(c,i){return '<span class="chip">'+esc(c)+'<button data-delcat="'+t+':'+i+'" aria-label="Remove '+esc(c)+'">✕</button></span>'}).join('')+'</div><div style="display:flex;gap:8px"><input id="nc_'+t+'" placeholder="New category" style="margin:0"><button class="btn" data-addcat="'+t+'" style="width:auto;padding:0 18px">Add</button></div></div>'});
 return h+'<p class="mute">Removing a category keeps your past entries under that name.</p>'}
function settings(){
 var perm=NATIVE?'managed by Android':(('Notification' in window)?Notification.permission:'unsupported');
 return '<div class="card"><h2>Daily reminder</h2><label>Remind me at</label><input type="time" id="rt" value="'+S.set.time+'"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ron" style="width:auto;margin:0" '+(S.set.on?'checked':'')+'> Remind me every day</label><br><button class="btn" id="rsave">Save reminder</button><p class="mute" style="margin-bottom:0">Notifications: '+perm+'. The reminder arrives every day at this time, even when Batwa is closed. If you open the app after the time without logging anything, a banner also nudges you.</p></div><div class="card"><h2>Your data</h2><p class="mute">Everything is stored on this device only, so Batwa works offline.</p><button class="btn alt" id="exp" style="margin-bottom:8px">Copy backup</button><button class="btn alt" id="imp">Restore from backup</button></div>'}
function render(){
 var a=$('#app');
 var title={home:'Batwa',loans:'Loans',cats:'Categories',set:'Reminder'}[V.tab];
 var ban='';if(due())ban='<div class="banner"><span>Time to log today’s income and expenses.</span><button id="addb">Add</button></div>';
 a.innerHTML='<header><h1>'+title+'</h1></header>'+ban+({home:home,loans:loans,cats:cats,set:settings}[V.tab])();
 document.querySelectorAll('nav.tabs [data-t]').forEach(function(b){b.classList.toggle('on',b.dataset.t===V.tab)})}
function due(){
 if(!S.set.on)return false;var n=new Date(),t=S.set.time.split(':');
 if(n.getHours()*60+n.getMinutes()<+t[0]*60+ +t[1])return false;
 return !S.tx.some(function(x){return x.date===iso(n)})}
var LN=(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications)||null;
var NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
async function applyReminder(ask){
 if(!NATIVE||!LN)return 'web';
 try{
  await LN.cancel({notifications:[{id:1}]});
  if(!S.set.on)return 'off';
  var p=await LN.checkPermissions();
  if(p.display!=='granted'&&ask)p=await LN.requestPermissions();
  if(p.display!=='granted')return 'denied';
  try{await LN.createChannel({id:'reminders',name:'Daily reminder',description:'Reminds you to log income and expenses',importance:4})}catch(e){}
  var t=S.set.time.split(':');
  await LN.schedule({notifications:[{id:1,title:'Batwa',body:'Time to log today\u2019s income and expenses.',channelId:'reminders',schedule:{on:{hour:+t[0],minute:+t[1]},allowWhileIdle:true}}]});
  return 'ok';
 }catch(e){return 'error'}}
function notify(){
 if(NATIVE||!S.set.on)return;var n=new Date(),t=S.set.time.split(':');
 if(n.getHours()===+t[0]&&n.getMinutes()===+t[1]&&S.set.last!==iso(n)){
  S.set.last=iso(n);persist();
  try{if('Notification' in window&&Notification.permission==='granted')new Notification('Batwa',{body:'Time to log today\u2019s income and expenses.'})}catch(e){}
  render()}}
function modal(html){var m=document.createElement('div');m.className='modal';m.innerHTML='<div class="sheet">'+html+'</div>';
 m.addEventListener('click',function(e){if(e.target===m)m.remove()});document.body.appendChild(m);return m}
function addEntry(){
 var type=V.type;
 var m=modal('<div class="seg"><button data-mt="expense">Spent</button><button data-mt="income">Received</button></div><label>Amount (₹)</label><input id="ea" type="number" inputmode="decimal" class="amt" placeholder="0"><label>Category</label><select id="ec"></select><label>Date</label><input id="ed" type="date" value="'+iso(new Date())+'"><label>Note (optional)</label><input id="en" maxlength="60"><button class="btn" id="es">Save entry</button>');
 function fill(){m.querySelectorAll('[data-mt]').forEach(function(b){b.classList.toggle('on',b.dataset.mt===type)});
  var c=S.cats[type];m.querySelector('#ec').innerHTML=c.length?c.map(function(x){return '<option>'+esc(x)+'</option>'}).join(''):'<option value="">Uncategorised</option>'+'';}
 fill();
 m.addEventListener('click',function(e){var b=e.target.closest('[data-mt]');if(b){type=b.dataset.mt;fill()}});
 m.querySelector('#es').onclick=function(){var v=parseFloat(m.querySelector('#ea').value);
  if(!(v>0)){m.querySelector('#ea').focus();return}
  S.tx.push({id:Date.now(),type:type,amt:v,cat:m.querySelector('#ec').value||'Uncategorised',date:m.querySelector('#ed').value||iso(new Date()),note:m.querySelector('#en').value.trim()});
  persist();V.type=type;V.tab='home';m.remove();render()}}
function addLoan(){
 var m=modal('<h2>Add loan</h2><div class="seg"><button data-md="lent" class="on">I lent</button><button data-md="borrowed">I borrowed</button></div><label>Person</label><input id="ln"><label>Amount (₹)</label><input id="la" type="number" inputmode="decimal"><label>Note (optional)</label><input id="lo" maxlength="60"><button class="btn" id="ls">Save loan</button>');
 var dir='lent';
 m.addEventListener('click',function(e){var b=e.target.closest('[data-md]');if(b){dir=b.dataset.md;m.querySelectorAll('[data-md]').forEach(function(x){x.classList.toggle('on',x===b)})}});
 m.querySelector('#ls').onclick=function(){var v=parseFloat(m.querySelector('#la').value),n=m.querySelector('#ln').value.trim();
  if(!(v>0)||!n)return;S.loans.push({id:Date.now(),dir:dir,name:n,amt:v,date:iso(new Date()),note:m.querySelector('#lo').value.trim()});persist();m.remove();render()}}
document.addEventListener('click',function(e){
 var t=e.target,b;
 if(t.id==='add'){addEntry();return}
 if(t.id==='addb'){addEntry();return}
 if(t.id==='addloan'){addLoan();return}
 if(b=t.closest('nav.tabs [data-t]')){V.tab=b.dataset.t;render();return}
 if(b=t.closest('[data-per]')){V.per=b.dataset.per;render();return}
 if(b=t.closest('[data-type]')){V.type=b.dataset.type;render();return}
 if(b=t.closest('[data-nav]')){var d=new Date(V.d),s=+b.dataset.nav;if(V.per==='day')d.setDate(d.getDate()+s);else{d.setDate(1);d.setMonth(d.getMonth()+s)}V.d=d;render();return}
 if(b=t.closest('[data-deltx]')){if(confirm('Delete this entry?')){S.tx=S.tx.filter(function(x){return x.id!=b.dataset.deltx});persist();render()}return}
 if(b=t.closest('[data-delloan]')){if(confirm('Delete this loan?')){S.loans=S.loans.filter(function(x){return x.id!=b.dataset.delloan});persist();render()}return}
 if(b=t.closest('[data-addcat]')){var k=b.dataset.addcat,i=$('#nc_'+k),v=i.value.trim();if(v&&S.cats[k].indexOf(v)<0){S.cats[k].push(v);persist();render()}return}
 if(b=t.closest('[data-delcat]')){var p=b.dataset.delcat.split(':');S.cats[p[0]].splice(+p[1],1);persist();render();return}
 if(t.id==='rsave'){S.set.time=$('#rt').value||'20:00';S.set.on=$('#ron').checked;S.set.last='';persist();
  applyReminder(true).then(function(r){
   var msg={ok:'Reminder set for '+S.set.time+' every day.',off:'Reminder turned off.',denied:'Notifications are blocked. Allow them for Batwa in Android Settings > Apps > Batwa > Notifications.',error:'Could not schedule the reminder. Please try again.',web:S.set.on?'Reminder saved for '+S.set.time+'.':'Reminder turned off.'}[r];
   if(r==='web'&&S.set.on&&'Notification' in window&&Notification.permission==='default'){try{Notification.requestPermission()}catch(x){}}
   render();alert(msg)});return}
 if(t.id==='exp'){var txt=JSON.stringify(S);(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){alert('Backup copied. Paste it into a note or message to keep it safe.')},function(){var m=modal('<h2>Backup</h2><label>Select all and copy</label><textarea id="bk" readonly>'+esc(txt)+'</textarea>');m.querySelector('#bk').select()});return}
 if(t.id==='imp'){var m=modal('<h2>Restore backup</h2><label>Paste your backup text</label><textarea id="bk"></textarea><button class="btn" id="bgo">Restore</button>');m.querySelector('#bgo').onclick=function(){try{var o=JSON.parse(m.querySelector('#bk').value);if(!o.tx||!o.cats||!o.loans)throw 0;if(!confirm('This replaces everything currently in Batwa. Continue?'))return;S=o;persist();m.remove();applyReminder(false);render()}catch(x){alert('That is not a valid Batwa backup.')}};return}
});
setInterval(notify,20000);document.addEventListener('visibilitychange',function(){if(!document.hidden){notify();render()}});
render();notify();applyReminder(false);
})();
