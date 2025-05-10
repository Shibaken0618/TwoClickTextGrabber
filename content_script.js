// use full-range selection with post-cleaning to avoid overly strict containers

let active = false;
let clickCount = 0;
let startPos = null;

console.log('Content script loaded');

browser.runtime.onMessage.addListener((msg) => {
if (msg.action === 'activate' && !active) {
console.log('Activating text-grab mode');
active = true;
clickCount = 0;
document.body.style.cursor = 'crosshair';
document.addEventListener('mousedown', onClick, true);
alert('Text-grabbing mode ON: click start and end');
}
});

function onClick(e) {
e.preventDefault();
e.stopPropagation();
const { clientX: x, clientY: y } = e;
const range = getRange(x, y);
if (!range) return;

if (clickCount === 0) {
startPos = range;
clickCount = 1;
alert('Start point set. Now click end point.');
} else {
// Build a new Range from start to this end
const endPos = range;
const selRange = document.createRange();
selRange.setStart(startPos.startContainer, startPos.startOffset);
selRange.setEnd(endPos.startContainer, endPos.startOffset);
let text = selRange.toString();

// Clean up whitespace and blank lines
text = text
  .split(/\r?\n/)                 
  .map(line => line.trim())       
  .filter(line => line.length)     
  .join('\n');           

copyText(text);
cleanup();
alert('Copied to clipboard.');

}
}

function getRange(x, y) {
if (document.caretPositionFromPoint) {
const pos = document.caretPositionFromPoint(x, y);
const r = document.createRange();
r.setStart(pos.offsetNode, pos.offset);
r.collapse(true);
return r;
} else if (document.caretRangeFromPoint) {
return document.caretRangeFromPoint(x, y);
}
return null;
}

function copyText(str) {
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(str).catch(console.error);
} else {
const ta = document.createElement('textarea');
ta.value = str;
document.body.appendChild(ta);
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
}
}

function cleanup() {
document.removeEventListener('mousedown', onClick, true);
document.body.style.cursor = '';
active = false;
clickCount = 0;
startPos = null;
}
