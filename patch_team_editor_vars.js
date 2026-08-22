import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

// The JSX was removed, so we should safely remove the unused functions and state if we want to be thorough.
// But if they are just not complaining, we can leave it.

console.log("Checking for eslint errors is better");
