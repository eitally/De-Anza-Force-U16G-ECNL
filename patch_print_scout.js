import fs from 'fs';
let content = fs.readFileSync('src/components/PrintScoutingPack.tsx', 'utf8');

const oldNotes = `                      {/* Dedicated Notes Sub-Row for College Evaluators */}
                      <tr className="bg-slate-50/60 border-b-2 border-slate-300 print-break-inside-avoid">
                        <td colSpan={9} className="py-1 px-2.5 text-[10.5px] text-slate-600 border-t border-dashed border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 text-[9.5px]">
                              Scout Notes:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-300 h-2"></div>
                          </div>
                        </td>
                      </tr>`;

const newNotes = `                      {/* Dedicated Notes Sub-Row for College Evaluators */}
                      <tr className="bg-slate-50/60 border-b-2 border-slate-300 print-break-inside-avoid">
                        <td colSpan={9} className="py-1.5 px-2.5 text-[10.5px] text-slate-600 border-t border-dashed border-slate-200">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 text-[9.5px]">
                              Scout Notes:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-2"></div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 text-[9.5px] invisible">
                              Scout Notes:
                            </span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-2"></div>
                          </div>
                        </td>
                      </tr>`;

content = content.replace(oldNotes, newNotes);

fs.writeFileSync('src/components/PrintScoutingPack.tsx', content);
