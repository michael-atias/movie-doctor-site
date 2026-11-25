/* runs before the first paint: never shown inside someone else's frame; the hero entrance and moment guards */
if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = 'none'; } }
document.documentElement.classList.add('m-enter'); setTimeout(() => document.documentElement.classList.add('m-enter-done'), 700);
document.documentElement.classList.add('mo-js'); setTimeout(() => document.documentElement.classList.add('mo-safe'), 2500);
