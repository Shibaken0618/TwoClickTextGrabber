// Listens for commands or toolbar clicks and notifies the content script

console.log('Background script loaded');

browser.commands.onCommand.addListener((command) => {
console.log('Received command:', command);
if (command === 'start-text-grab') {
notifyContent();
}
});

browser.browserAction.onClicked.addListener((tab) => {
console.log('Toolbar icon clicked');
notifyContent(tab.id);
});

function notifyContent(tabId) {
browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
const targetId = tabId || tabs[0].id;
browser.tabs.sendMessage(targetId, { action: 'activate' });
});
}