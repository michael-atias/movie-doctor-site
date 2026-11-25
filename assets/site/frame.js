/* the small pages: never shown inside someone else's frame */
if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = 'none'; } }
