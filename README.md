# Kwork Hider — скрыть и сохранить 🚀

**Kwork Hider** — лёгкое расширение для Chrome/Firefox, которое убирает шум на [kwork.ru/projects](https://kwork.ru/projects).  
Скрывай неинтересные проекты в 1 клик (`× Скрыть`) и сохраняй интересные (`☆ Сохранить`) — больше не листай одно и то же по кругу. Вся история только локально в браузере.

🌐 **Ленд:** https://code.apofeouz.ru/kwork-hider/ (скоро) · **Хаб:** https://code.apofeouz.ru/

---

## ✨ Что умеет

- **× Скрыть** — карточка исчезает (`display:none`) и уходит в попап → `Скрытые`. Вернуть — 1 клик в попапе.
- **☆ Сохранить** — подсветка `#22c55e` + рамка, уходит в `Сохраненные` — вернёшься когда готов взяться, не потеряешь.
- **Попап** с 2 вкладками: `Скрытые (n)` / `Сохраненные (n)` — список с `title → ссылка`, датой, `×` удалить и `Очистить всё`.
- **Бейдж** на иконке — сколько спрятано+сохранено (серый/зелёный).
- **Onboarding** при установке — как закрепить иконку 📌.
- Работает с динамической подгрузкой (MutationObserver), переживает пагинацию kwork.

## 📸 Скриншоты

_До/После + попап — добавлю после первой публикации_

## 🧩 Как это облегчает жизнь

На `kwork.ru/projects` фильтра `скрыть неинтересное` нет — листаешь 50 проектов и снова видишь фуфел. С `Kwork Hider` нажал `×` — и больше не показывается, интересное `☆` — не потеряется в ленте. Экономишь часы в неделю.

## ⚙️ Установка

**Из Store (скоро):** Chrome Web Store → `Kwork Hider`

**Вручную:**
```bash
git clone https://github.com/apofeouz/kwork-hider.git
```
`chrome://extensions/` → Режим разработчика → Загрузить распакованное → папка `KworkHider`

## 🛠️ Технологии

- Manifest V3 + `action` + `background service_worker`
- Content Scripts + `chrome.storage.local` (`kwork_hidden`, `kwork_interesting`)
- MutationObserver для ленты kwork

## 🤝 Поддержка

Баг/идея → [Issues](https://github.com/apofeouz/kwork-hider/issues)  
Если помогло — ⭐ на GitHub и `★ Оценить` в попапе. Угостить: [ЮMoney](https://yoomoney.ru/to/41001166778763)

## Version

**1.0.0** — первый релиз для Store. Смотрите [Releases](https://github.com/apofeouz/kwork-hider/releases).
