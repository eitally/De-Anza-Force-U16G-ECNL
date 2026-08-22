import fs from 'fs';

let code = fs.readFileSync('src/data/defaultData.ts', 'utf8');

// The file has json.
// I can just replace "email": with "contactEmail":
code = code.replace(/"email":/g, '"contactEmail":');

// For "imageUrl":, we can replace it with "photoUrl":
// But if "photoUrl" already exists, this might create duplicate keys.
// So let's parse the array and re-stringify it.

const startIdx = code.indexOf('export const INITIAL_PLAYERS: Player[] = [');
const endIdx = code.indexOf('export const INITIAL_MATCHES', startIdx);
let arrStr = code.substring(startIdx + 'export const INITIAL_PLAYERS: Player[] = '.length, endIdx).trim();
if (arrStr.endsWith(';')) arrStr = arrStr.slice(0, -1);

let arr = JSON.parse(arrStr);
arr = arr.map(p => {
    if (p.email) {
        p.contactEmail = p.email;
        delete p.email;
    }
    if (p.imageUrl) {
        if (!p.photoUrl || p.photoUrl.includes('wikimedia')) {
            p.photoUrl = p.imageUrl;
        }
        delete p.imageUrl;
    }
    return p;
});

const newStr = 'export const INITIAL_PLAYERS: Player[] = ' + JSON.stringify(arr, null, 2) + ';\n\n';
const updated = code.slice(0, startIdx) + newStr + code.slice(endIdx);
fs.writeFileSync('src/data/defaultData.ts', updated);

