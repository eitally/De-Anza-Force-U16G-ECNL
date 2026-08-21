import fs from 'fs';
const js = fs.readFileSync('vercel_js.js', 'utf8');
const start = js.indexOf('Ip={');
const end = js.indexOf('const Bu={id:"ig-post-latest"');
fs.writeFileSync('extracted.txt', js.substring(start, end));
