import fs from 'fs';
let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const target = `            )}
          </div>

          {/* Right Column: Action Photo Carousel & Next Match Spotlight */}`;

const widget = `            )}

            {/* Recent Form Widget */}
            {teamInfo.recentForm && teamInfo.recentForm.length > 0 && (
              <div className="relative w-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#11192e] dark:to-[#0a0f1d] border border-slate-200 dark:border-blue-900/50 p-3.5 shadow-md overflow-hidden group mt-4">
                <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Recent Form
                    </span>
                  </div>
                  {teamInfo.recentFormStat && (
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      {teamInfo.recentFormStat}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {teamInfo.recentForm.map((result, idx) => (
                    <div 
                      key={idx} 
                      className={\`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black shadow-sm \${
                        result === 'W' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' :
                        result === 'D' ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' :
                        result === 'L' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }\`}
                    >
                      {result}
                    </div>
                  ))}
                  <div className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
                    Last {teamInfo.recentForm.length} Matches
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Action Photo Carousel & Next Match Spotlight */}`;

content = content.replace(target, widget);

fs.writeFileSync('src/components/Hero.tsx', content);
