const cntHidden = document.getElementById('cntHidden');
const cntInterest = document.getElementById('cntInterest');
const listEl = document.getElementById('list');
const clearBtn = document.getElementById('clear');
let currentTab = 'hidden';
let hiddenMap={}, interestMap={};

function fmt(ts){
  const d=new Date(ts), now=new Date();
  const isToday=d.toDateString()===now.toDateString();
  const t=d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  return isToday?`сегодня ${t}`: d.toLocaleDateString('ru-RU');
}
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function load(){
  chrome.storage.local.get({kwork_hidden:{}, kwork_interesting:{}}, (r)=>{
    hiddenMap=r.kwork_hidden||{};
    interestMap=r.kwork_interesting||{};
    cntHidden.textContent = Object.keys(hiddenMap).length;
    cntInterest.textContent = Object.keys(interestMap).length;
    render();
  });
}
function render(){
  const map = currentTab==='hidden'? hiddenMap : interestMap;
  const entries = Object.values(map).sort((a,b)=>b.ts-a.ts);
  if(!entries.length){
    listEl.innerHTML = `<div class="empty">${currentTab==='hidden'?'Нет скрытых — нажми × Скрыть на карточке':'Нет сохраненных — нажми ☆ Сохранить'}</div>`;
    return;
  }
  listEl.innerHTML = entries.map(e=>`
    <div class="item">
      <a href="${escapeHtml(e.href)}" target="_blank" title="${escapeHtml(e.title)}">${escapeHtml(e.title)}</a>
      <span class="date">${fmt(e.ts)}</span>
      <button class="x" data-id="${escapeHtml(e.id)}">×</button>
    </div>
  `).join('');
  listEl.querySelectorAll('.x').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id=b.dataset.id;
      // tell content to remove and also update storage
      chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
        const tab=tabs[0];
        if(tab && tab.url && tab.url.includes('kwork.ru')){
          chrome.tabs.sendMessage(tab.id, {type:'REMOVE_ONE', list: currentTab, id}, ()=>{
            load();
          });
        } else {
          // direct storage fallback
          if(currentTab==='hidden') delete hiddenMap[id];
          else delete interestMap[id];
          const key = currentTab==='hidden' ? 'kwork_hidden' : 'kwork_interesting';
          const val = currentTab==='hidden' ? hiddenMap : interestMap;
          chrome.storage.local.set({[key]: val}, load);
        }
      });
    });
  });
}

document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    render();
  });
});

clearBtn.addEventListener('click', ()=>{
  const map = currentTab==='hidden'? hiddenMap: interestMap;
  if(!Object.keys(map).length) return;
  if(!confirm(`Очистить ${currentTab==='hidden'?'скрытые':'сохраненные'} (${Object.keys(map).length})?`)) return;
  const key = currentTab==='hidden'? 'kwork_hidden':'kwork_interesting';
  chrome.storage.local.set({[key]:{}}, ()=>{
    chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
      const tab=tabs[0];
      if(tab && tab.url && tab.url.includes('kwork.ru')){
        chrome.tabs.sendMessage(tab.id, {type:'CLEAR_ALL'}).catch(()=>{});
      }
    });
    load();
  });
});
document.getElementById('openKwork').addEventListener('click', ()=> chrome.tabs.create({url:'https://kwork.ru/projects'}));

load();
