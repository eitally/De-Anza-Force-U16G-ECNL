import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

const startStr = "{/* SECTION 1: PERMANENT MASTER TEAM ALBUM LIST";
const endStr = "{activeTab === 'import_export' && (";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  // we want to preserve the end of the `media` block, so close its div.
  content = content.substring(0, startIndex) + "</div>\n          )}\n\n          {/* TAB: DATA MANAGEMENT */}\n          " + content.substring(endIndex);
  fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end bounds.");
}
