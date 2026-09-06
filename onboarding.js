document.getElementById('close').addEventListener('click', (e)=>{
  e.preventDefault();
  window.close();
  chrome.tabs.update({url:'https://kwork.ru/projects'});
});
