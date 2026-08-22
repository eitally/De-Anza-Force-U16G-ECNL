import fs from 'fs';
let content = fs.readFileSync('src/components/TeamEditorModal.tsx', 'utf8');

const target = `                </div>
              </div>

              {/* SECTION: ECNL STANDINGS TABLE EDITOR */}`;

const replacement = `                </div>
              </div>

              {/* SECTION: RECENT FORM */ }
              <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white mt-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Recent Form Widget
              </h3>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 text-xs">Recent Form (Comma separated, e.g. W,W,D,L,W)</label>
                  <input
                    type="text"
                    value={(localTeamInfo.recentForm || []).join(',')}
                    onChange={(e) => {
                      const parts = e.target.value.split(',').map(s => s.trim().toUpperCase());
                      // Only keep valid W, D, L, or -
                      const validParts = parts.filter(p => ['W', 'D', 'L', '-'].includes(p)) as ('W'|'D'|'L'|'-')[];
                      setLocalTeamInfo({ ...localTeamInfo, recentForm: validParts });
                    }}
                    placeholder="W,D,W,L,W"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1 text-xs">Mini-Stat Highlight</label>
                  <input
                    type="text"
                    value={localTeamInfo.recentFormStat || ''}
                    onChange={(e) => setLocalTeamInfo({ ...localTeamInfo, recentFormStat: e.target.value })}
                    placeholder="e.g. 3 Clean Sheets in last 5 matches"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              {/* SECTION: ECNL STANDINGS TABLE EDITOR */}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/TeamEditorModal.tsx', content);
