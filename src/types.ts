export type PositionCategory = 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper';

export interface PlayerStats {
  appearances: number;
  starts?: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  saves?: number;
  minutesPlayed?: number;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  primaryPosition: PositionCategory;
  specificPosition: string; // e.g. 'Center Forward (#9)', 'Attacking Mid (#10)', 'Center Back (#4)', 'Left Winger (#11)', 'Goalkeeper (#1)'
  secondaryPositions: string[];
  gradYear: number; // e.g. 2028 or 2029
  ageGroup?: string; // e.g. 'U16' or 'U16 (2010)'
  birthYear?: number; // 2010, 2011, 2012
  birthday?: string; // e.g. '2010-08-22' or '08/22/2010'
  height: string; // e.g. 5'7"
  weight?: string; // e.g. 125 lbs
  dominantFoot: 'Right' | 'Left' | 'Both';
  highSchool: string;
  gpa: string;
  photoUrl: string;
  actionPhotoUrl?: string;
  bio?: string;
  commitment: string; // e.g. "Uncommitted" or "Stanford University"
  ncaaId?: string;
  highlightsUrl?: string; // YouTube, Hudl, or Veo link
  profileDocUrl?: string; // Link to player's PDF profile/flyer
  profilePdfUrl?: string; // Downloadable player profile PDF link
  instagram?: string;
  contactEmail?: string;
  awards: string[];
  stats: PlayerStats;
  isCaptain?: boolean;
  hometown?: string;
}

export type MatchStatus = 'upcoming' | 'live' | 'completed';
export type MatchCompetition = 'ECNL Northern California' | 'Surf Cup' | 'ECNL National Showcase' | 'SilverLakes Showcase' | 'NorCal State Cup' | 'Friendly';

export interface Match {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. '11:00 AM PST'
  opponent: string;
  opponentLocation?: string;
  opponentLogo?: string;
  isHome: boolean;
  competition: MatchCompetition;
  venue: string;
  fieldNumber?: string;
  address: string;
  mapUrl: string;
  status: MatchStatus;
  teamScore?: number;
  opponentScore?: number;
  homeKitColor: string; // e.g. 'Royal Blue'
  awayKitColor: string; // e.g. 'Solid Black'
  scorers?: string[];
  gameNotes?: string;
  videoLiveStreamUrl?: string;
}

export interface StandingTeam {
  rank: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  pointsPerGame: number;
  form: ('W' | 'D' | 'L' | '-')[];
  isCurrentTeam?: boolean;
  isForce?: boolean;
  qualification?: string;
  gamesPlayed?: number;
  wins?: number;
  draws?: number;
  losses?: number;
}

export interface Coach {
  id: string;
  name: string;
  role: string; // e.g. 'Head Coach', 'Associate Head Coach', 'College Recruiting Coordinator', 'Goalkeeper Specialist'
  license: string; // e.g. 'USSF A-Senior License', 'UEFA B License'
  experience: string; // e.g. '12+ Years Elite Youth & NCAA'
  email: string;
  phone: string;
  photoUrl: string;
  bio: string;
  almaMater?: string;
}

export interface TournamentHonor {
  id: string;
  title: string;
  year: string;
  placement: string; // e.g. 'Champions', 'Finalists', 'National Semifinalists'
  location: string;
  division: string;
  iconName?: string;
}

export interface TeamInfo {
  clubName: string;
  teamName: string;
  shortName: string;
  ageGroup: string;
  birthYear: number;
  league: string;
  division: string;
  conference: string;
  region: string;
  homeFacility: string;
  facilityAddress: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  seasonRecord: {
    wins: number;
    losses: number;
    draws: number;
    goalsFor: number;
    goalsAgainst: number;
    cleanSheets: number;
    norcalRank: number;
    nationalRank: number;
  };
  announcement: {
    show: boolean;
    badge: string;
    text: string;
    actionText?: string;
    actionLink?: string;
  };
  showRecruitmentHub?: boolean;
  socialLinks: {
    instagram?: string;
    youtube?: string;
    hudl?: string;
    veo?: string;
    website?: string;
    photosHub?: string;
  };
  teamPhotoUrl?: string;
  teamPhotoCaption?: string;
  recentForm?: ('W' | 'D' | 'L' | '-')[];
  recentFormStat?: string;
}

export interface ActionPhoto {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  tag?: string;
  date?: string;
}

export interface GooglePhotosAlbum {
  id: string;
  title: string;
  subtitle: string;
  albumUrl: string;
  coverImageUrl: string;
  date: string;
  photoCount?: string;
  badge?: string;
}

export interface MasterAlbumInfo {
  url: string;
  title: string;
  subtitle: string;
  photographerName?: string;
  badge?: string;
}
