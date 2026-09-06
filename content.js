(() => {
  'use strict';
  const HIDDEN_KEY = 'kwork_hidden';
  const INTEREST_KEY = 'kwork_interesting';
  const SELECTOR_CARD = '.want-card.want-card--list, .want-card';
  const SELECTOR_LINK = '.wants-card__header-title a[href^="/projects/"]';
  const PROCESSED = new WeakSet();

  let hiddenMap = {};
  let interestMap = {};

  function loadMaps(cb){
    chrome.storage.local.get({[HIDDEN_KEY]:{}, [INTEREST_KEY]:{}}, (r)=>{
      hiddenMap = r[HIDDEN_KEY]||{};
      interestMap = r[INTEREST_KEY]||{};
      if(cb) cb();
    });
  }
  function saveHidden(){ chrome.storage.local.set({[HIDDEN_KEY]: hiddenMap}, ()=> updateBadge()); }
  function saveInterest(){ chrome.storage.local.set({[INTEREST_KEY]: interestMap}, ()=> updateBadge()); }
  function updateBadge(){
    const total = Object.keys(hiddenMap).length + Object.keys(interestMap).length;
    try{ chrome.runtime.sendMessage({type:'UPDATE_BADGE', count: total}); }catch{}
  }

  function extractId(card){
    const a = card.querySelector(SELECTOR_LINK);
    if(!a) return null;
    const href = a.getAttribute('href')||'';
    const m = href.match(/\/projects\/(\d+)/);
    return m ? m[1] : href;
  }
  function getTitle(card){
    const a = card.querySelector(SELECTOR_LINK);
    return a ? a.textContent.trim().slice(0,120) : 'Проект';
  }
  function getHref(card){
    const a = card.querySelector(SELECTOR_LINK);
    return a ? 'https://kwork.ru' + a.getAttribute('href') : location.href;
  }

  function applyState(card){
    const id = extractId(card);
    if(!id) return;
    const isHidden = !!hiddenMap[id];
    const isInterest = !!interestMap[id];
    // сброс
    card.style.display = '';
    card.style.opacity = '';
    card.style.outline = '';
    card.classList.remove('kwork-hidden','kwork-interest');
    // кнопки активные
    const hideBtn = card.querySelector('.kwork-btn-hide');
    const starBtn = card.querySelector('.kwork-btn-star');
    if(hideBtn) hideBtn.classList.toggle('active', isHidden);
    if(starBtn) starBtn.classList.toggle('active', isInterest);
    if(isHidden){
      // скрываем полностью, но оставляем тонкой полоской чтобы можно было вернуть via попап
      card.style.display = 'none';
      card.classList.add('kwork-hidden');
    } else if(isInterest){
      card.style.outline = '2px solid #22c55e';
      card.style.outlineOffset = '4px';
      card.style.borderRadius = '6px';
      card.classList.add('kwork-interest');
    }
  }

  function injectButtons(card){
    if(PROCESSED.has(card)) return;
    PROCESSED.add(card);
    const id = extractId(card);
    if(!id) return;
    const btnBox = card.querySelector('.want-card__buttons');
    if(!btnBox) return;
    // контейнер для наших кнопок
    let box = card.querySelector('.kwork-hider-box');
    if(box) return;
    box = document.createElement('div');
    box.className = 'kwork-hider-box';
    box.style.display = 'flex';
    box.style.gap = '6px';
    box.style.marginRight = '6px';
    box.style.alignItems = 'center';
    box.innerHTML = `
      <button class="kwork-btn-hide" title="Скрыть — не интересно" style="padding:4px 8px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:6px;font-size:11px;cursor:pointer">× Скрыть</button>
      <button class="kwork-btn-star" title="Сохранить — интересно, вернусь" style="padding:4px 8px;border:1px solid #22c55e;background:#f0fdf4;border-radius:6px;font-size:11px;cursor:pointer">☆ Сохранить</button>
    `;
    btnBox.prepend(box);
    const hideBtn = box.querySelector('.kwork-btn-hide');
    const starBtn = box.querySelector('.kwork-btn-star');
    hideBtn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const isHidden = !!hiddenMap[id];
      if(isHidden){
        delete hiddenMap[id];
      } else {
        hiddenMap[id] = {id, title: getTitle(card), href: getHref(card), ts: Date.now()};
        // если был в интересных — убираем оттуда
        if(interestMap[id]) delete interestMap[id];
      }
      saveHidden(); saveInterest();
      applyState(card);
    });
    starBtn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const isInterest = !!interestMap[id];
      if(isInterest){
        delete interestMap[id];
      } else {
        interestMap[id] = {id, title: getTitle(card), href: getHref(card), ts: Date.now()};
        if(hiddenMap[id]) delete hiddenMap[id];
      }
      saveInterest(); saveHidden();
      applyState(card);
    });
    applyState(card);
  }

  function scan(){
    document.querySelectorAll(SELECTOR_CARD).forEach(card=>{
      injectButtons(card);
      // также применяем состояние для уже обработанных (если maps обновились извне)
      applyState(card);
    });
  }

  // сообщения из попапа
  chrome.runtime.onMessage.addListener((msg, s, send)=>{
    if(msg.type==='GET_COUNTS'){
      send({hidden: Object.keys(hiddenMap).length, interest: Object.keys(interestMap).length});
      return true;
    }
    if(msg.type==='GET_LISTS'){
      send({hidden: hiddenMap, interest: interestMap});
      return true;
    }
    if(msg.type==='CLEAR_ALL'){
      hiddenMap={}; interestMap={};
      chrome.storage.local.set({[HIDDEN_KEY]:{}, [INTEREST_KEY]:{}}, ()=>{
        document.querySelectorAll(SELECTOR_CARD).forEach(applyState);
        updateBadge();
        send({ok:true});
      });
      return true;
    }
    if(msg.type==='REMOVE_ONE'){
      if(msg.list==='hidden' && hiddenMap[msg.id]) delete hiddenMap[msg.id];
      if(msg.list==='interest' && interestMap[msg.id]) delete interestMap[msg.id];
      saveHidden(); saveInterest();
      document.querySelectorAll(SELECTOR_CARD).forEach(applyState);
      send({ok:true}); return true;
    }
  });

  chrome.storage.onChanged.addListener((ch, area)=>{
    if(area==='local' && (ch[HIDDEN_KEY] || ch[INTEREST_KEY])){
      if(ch[HIDDEN_KEY]) hiddenMap = ch[HIDDEN_KEY].newValue||{};
      if(ch[INTEREST_KEY]) interestMap = ch[INTEREST_KEY].newValue||{};
      document.querySelectorAll(SELECTOR_CARD).forEach(applyState);
    }
  });

  loadMaps(()=>{
    scan();
    const mo = new MutationObserver(()=> scan());
    mo.observe(document.body, {childList:true, subtree:true});
  });
})();
