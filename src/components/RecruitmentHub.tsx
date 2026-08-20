import React from 'react';
import { Coach, Player, TeamInfo } from '../types';
import { getSafeImageSrc, handleImageError, DEFAULT_COACH_PHOTO } from '../utils/imageUtils';
import { 
  GraduationCap, 
  FileDown, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Video, 
  Award, 
  Sparkles, 
  CheckCircle, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface RecruitmentHubProps {
  teamInfo: TeamInfo;
  coaches: Coach[];
  players: Player[];
  onOpenScoutPack: () => void;
}

export const RecruitmentHub: React.FC<RecruitmentHubProps> = ({
  teamInfo,
  coaches,
  players,
  onOpenScoutPack,
}) => {
  const fallbackCoach: Coach = {
    id: 'default-recruiting',
    name: 'Technical Staff',
    role: 'College Recruiting Coordinator',
    license: 'USSF Licensed Director',
    experience: '10+ Years',
    email: 'recruiting@deanzaforce.org',
    phone: '(408) 555-0199',
    photoUrl: DEFAULT_COACH_PHOTO,
    bio: 'Dedicated point of contact for college scouting inquiries, verified player film, and recruiting profiles.',
  };

  const recruitingCoach =
    (coaches && coaches.length > 0
      ? coaches.find((c) => (c.role || '').toLowerCase().includes('recruiting')) || coaches[0]
      : fallbackCoach) || fallbackCoach;

  const uncommittedCount = players.filter((p) => p.commitment === 'Uncommitted').length;
  const committedCount = players.length - uncommittedCount;

  // Calculate team average GPA
  const validGpas = players.map((p) => parseFloat(p.gpa)).filter((g) => !isNaN(g));
  const avgGpa = validGpas.length > 0 ? (validGpas.reduce((a, b) => a + b, 0) / validGpas.length).toFixed(2) : '4.15';

  const safeCoachPhoto = getSafeImageSrc(recruitingCoach.photoUrl, DEFAULT_COACH_PHOTO);

  return (
    <section id="recruiting" className="py-8 sm:py-12 bg-[#080c14] border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-none">
              COLLEGE <span className="text-blue-500">RECRUITMENT</span> HUB
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl">
              Dedicated resources for collegiate coaching staffs. Access verified player transcripts, NCAA Eligibility IDs, match film, and schedule showcase check-in meetings.
            </p>
          </div>

          <button
            onClick={onOpenScoutPack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-condensed font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-900/40 transition-all active:scale-95 border border-blue-400/40 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <FileDown className="w-4 h-4" />
            <span>Generate Official Scouting Packet (PDF)</span>
          </button>
        </div>

        {/* Highlight Stats Row */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1220] border border-blue-900/40 shadow-xl text-center">
            <div className="font-condensed font-black text-3xl sm:text-4xl text-white">
              {players.length}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">
              Roster Athletes
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1220] border border-blue-900/40 shadow-xl text-center">
            <div className="font-condensed font-black text-3xl sm:text-4xl text-blue-400">
              {avgGpa}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">
              Team Average GPA
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1220] border border-blue-900/40 shadow-xl text-center">
            <div className="font-condensed font-black text-3xl sm:text-4xl text-red-400">
              {uncommittedCount}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">
              Uncommitted Recruits
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1220] border border-blue-900/40 shadow-xl text-center">
            <div className="font-condensed font-black text-3xl sm:text-4xl text-emerald-400">
              95%+
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase mt-1">
              Club Collegiate Placement
            </div>
          </div>
        </div>

        {/* 2-Column Content: Coordinator Info & Academic Pedigree */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: College Coordinator Card */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0d162b] to-[#070b15] border border-blue-900/50 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span className="font-condensed font-black text-lg uppercase text-white">
                    College Liaison Contact
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-400 uppercase bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800">
                  Direct Line
                </span>
              </div>

              <div className="flex items-start gap-4 mb-5">
                <img
                  src={safeCoachPhoto}
                  alt={recruitingCoach.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
                  onError={(e) => handleImageError(e, DEFAULT_COACH_PHOTO)}
                />
                <div>
                  <h3 className="font-condensed font-black text-2xl uppercase text-white leading-tight">
                    {recruitingCoach.name}
                  </h3>
                  <div className="text-xs font-bold text-blue-400 mt-0.5">
                    {recruitingCoach.role}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {recruitingCoach.license}
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {recruitingCoach.bio}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800/80">
              <a
                href={`mailto:${recruitingCoach.email}?subject=College Scouting Inquiry - De Anza Force U16 ECNL`}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email: {recruitingCoach.email}</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={`tel:${recruitingCoach.phone}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span>Office: {recruitingCoach.phone}</span>
                </div>
                <span className="text-[10px] text-slate-400">Direct Call</span>
              </a>
            </div>
          </div>

          {/* Right Column: Why De Anza Force & Academic Standards */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-condensed font-black text-lg uppercase text-white">
                  Program Pedigree & Standards
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Elite National Competition:</strong> Regular participants in ECNL National Showcases (Phoenix, Florida, Seattle, New Jersey) and Surf Cup Best of the Best.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Rigorous Academic Excellence:</strong> Student-athletes attending top Silicon Valley college-preparatory schools with average unweighted GPA over 4.15.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Pro-Pathway Methodology:</strong> Year-round periodized curriculum focusing on cognitive speed of play, tactical maturity, and positional versatility.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Comprehensive Game Film:</strong> Full-match Veo tactical film and individual Hudl clip reels accessible upon coach request.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Scout Packet CTA Box */}
            <div className="mt-6 p-4 rounded-2xl bg-[#090d16] border border-blue-950 flex items-center justify-between gap-4">
              <div>
                <div className="font-condensed font-black text-sm uppercase text-white">
                  Need a printed showcase binder sheet?
                </div>
                <div className="text-[11px] text-slate-400">
                  Formatted for quick notes on the sideline at showcases.
                </div>
              </div>
              <button
                onClick={onOpenScoutPack}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 shrink-0 transition-colors"
              >
                Print Roster
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
