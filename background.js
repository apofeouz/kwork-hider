const BADGE_COLOR_HIDDEN = '#64748b';
const BADGE_COLOR_INTEREST = '#22c55e';

chrome.runtime.onInstalled.addListener((d)=>{
  if(d.reason==='install'){
    chrome.tabs.create({url: chrome.runtime.getURL('onboarding.html')});
  }
  updateBadge();
});
chrome.runtime.onStartup.addListener(updateBadge);
chrome.storage.onChanged.addListener((c,a)=>{
  if(a==='local' && (c.kwork_hidden || c.kwork_interesting)) updateBadge();
});
chrome.runtime.onMessage.addListener((m,s,send)=>{
  if(m && m.type==='UPDATE_BADGE'){ updateBadge(m.count); send({ok:true}); return true; }
});

function updateBadge(explicit){
  if(typeof explicit==='number'){ setBadge(explicit); return; }
  chrome.storage.local.get({kwork_hidden:{}, kwork_interesting:{}}, (r)=>{
    const h=Object.keys(r.kwork_hidden||{}).length;
    const i=Object.keys(r.kwork_interesting||{}).length;
    const total=h+i;
    if(!total){ chrome.action.setBadgeText({text:''}); return; }
    const txt= total>99? '99+': String(total);
    chrome.action.setBadgeText({text: txt});
    // если есть интересные — зеленый, иначе серый
    chrome.action.setBadgeBackgroundColor({color: i? BADGE_COLOR_INTEREST : BADGE_COLOR_HIDDEN});
  });
}
function setBadge(c){
  if(!c) chrome.action.setBadgeText({text:''});
  else { chrome.action.setBadgeText({text: c>99?'99+':String(c)}); chrome.action.setBadgeBackgroundColor({color: BADGE_COLOR_HIDDEN}); }
}
