import React from 'react';
import { Coach } from '../types';
import { getSafeImageSrc, handleImageError, DEFAULT_COACH_PHOTO } from '../utils/imageUtils';
import { ShieldCheck, Mail, Phone, Award } from 'lucide-react';

interface CoachingStaffProps {
  coaches: Coach[];
}

export const CoachingStaff: React.FC<CoachingStaffProps> = ({
  coaches,
}) => {
  return (
    <section id="staff" className="py-8 sm:py-12 bg-slate-50 dark:bg-[#060911] border-b border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-slate-900 dark:text-white leading-none">
              COACHING <span className="text-slate-900 dark:text-white">& STAFF</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Led by nationally licensed professionals dedicated to elite player development, tactical intelligence, and academic success.
            </p>
          </div>
        </div>

        {/* Coaches Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="rounded-2xl bg-white dark:bg-[#090e1c] border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Photo */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
                  <img
                    src={getSafeImageSrc(coach.photoUrl, DEFAULT_COACH_PHOTO)}
                    alt={coach.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e, DEFAULT_COACH_PHOTO)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e1c] via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-950/90 text-blue-300 border border-blue-700 backdrop-blur-md">
                      {coach.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="font-condensed font-black text-xl uppercase text-slate-900 dark:text-white leading-tight">
                    {coach.name}
                  </h3>

                  <div className="text-xs font-semibold text-blue-400 mt-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="line-clamp-1">{coach.license}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed line-clamp-3">
                    {coach.bio}
                  </p>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="p-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href={`mailto:${coach.email}`}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{coach.email}</span>
                </a>
                {coach.phone && (
                  <a
                    href={`tel:${coach.phone}`}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{coach.phone}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
