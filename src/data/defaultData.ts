
import { Player, Match, StandingTeam, Coach, TeamInfo } from '../types';

export const INITIAL_TEAM_INFO: TeamInfo = {
  "clubName": "De Anza Force Soccer Club",
  "teamName": "De Anza Force U16 ECNL",
  "shortName": "Force U16 ECNL",
  "ageGroup": "U16 Girls (ECNL)",
  "birthYear": 2010,
  "league": "Elite Clubs National League (ECNL)",
  "division": "Girls ECNL Northern California Conference",
  "conference": "Northern California Conference",
  "region": "Bay Area, CA",
  "homeFacility": "John Mise Field / De Anza College",
  "facilityAddress": "1125 Saratoga Ave, Cupertino, California 95129",
  "primaryColor": "#1D4ED8",
  "accentColor": "#DC2626",
  "secondaryColor": "#0B0F19",
  "seasonRecord": {
    "wins": 0,
    "losses": 0,
    "draws": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "cleanSheets": 0,
    "norcalRank": 1,
    "nationalRank": 4
  },
  "announcement": {
    "show": true,
    "badge": "ECNL NORCAL 2026-27",
    "text": "Official ECNL NorCal season schedule & player profiles updated. College coaches can download verified scout packets.",
    "actionText": "View Match Schedule",
    "actionLink": "#schedule"
  },
  "showRecruitmentHub": false,
  "socialLinks": {
    "instagram": "https://www.instagram.com/deanzaforce_2011g_ecnl/",
    "youtube": "https://youtube.com",
    "hudl": "https://hudl.com",
    "veo": "https://veo.co",
    "website": "https://www.deanzaforce.org",
    "photosHub": "https://linktr.ee/willow_glen_photography"
  },
  "teamPhotoUrl": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80",
  "teamPhotoCaption": "2026-2027 De Anza Force U16 ECNL Squad & Coaching Staff",
  "recentForm": ["W", "W", "D", "W", "L"],
  "recentFormStat": "3 Clean Sheets in last 5 matches"
};
export const INITIAL_PLAYERS: Player[] = [
  {
    "id": "p1",
    "name": "Eliot Kline",
    "jerseyNumber": 1,
    "primaryPosition": "Goalkeeper",
    "specificPosition": "Goalkeeper (GK)",
    "secondaryPositions": [
      "Goalkeeper"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'7\"",
    "weight": "125 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.02",
    "photoUrl": "https://i.imgur.com/mnc56aF.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "eliot.kline@gmail.com",
    "profileDocUrl": "Eliot Kline Player Profile.pdf",
    "awards": [
      "ECNL NorCal Candidate",
      "Clean Sheet Specialist"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "saves": 0,
      "minutesPlayed": 0
    },
    "hometown": "Cupertino, CA"
  },
  {
    "id": "p2",
    "name": "Elise Laxague",
    "jerseyNumber": 2,
    "primaryPosition": "Midfielder",
    "specificPosition": "Central Midfielder (CM)",
    "secondaryPositions": [
      "Attacking Midfielder",
      "Defensive Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'3\"",
    "weight": "112 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.03",
    "photoUrl": "https://i.imgur.com/FAqbkxw.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "eliselaxague11@gmail.com",
    "profileDocUrl": "Elise Laxague (1).pdf",
    "awards": [
      "ECNL NorCal Standout"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p3",
    "name": "Faith Vrionis",
    "jerseyNumber": 3,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back / Defender (CB)",
    "secondaryPositions": [
      "Fullback",
      "Forward"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'10\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.05",
    "photoUrl": "https://i.imgur.com/mDWC2cz.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "faith.vrionis@icloud.com",
    "profileDocUrl": "Faith Vrionis Player Profile (1).pdf",
    "awards": [
      "ECNL Best Defense Candidate",
      "Surf Cup Standout"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Sunnyvale, CA"
  },
  {
    "id": "p4",
    "name": "Breeze Longhenry",
    "jerseyNumber": 4,
    "primaryPosition": "Defender",
    "specificPosition": "Fullback / Defender (RB/LB)",
    "secondaryPositions": [
      "Center Back",
      "Wingback"
    ],
    "gradYear": 2030,
    "birthYear": 2011,
    "height": "5'5\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.90",
    "photoUrl": "https://i.imgur.com/CBROqa4.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "breezelonghenry@gmail.com",
    "profileDocUrl": "Breeze Longhenry Profile.pdf",
    "awards": [
      "ECNL Defensive Talent"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Los Gatos, CA"
  },
  {
    "id": "p7",
    "name": "Maya Onalfo",
    "jerseyNumber": 7,
    "primaryPosition": "Goalkeeper",
    "specificPosition": "Goalkeeper (GK)",
    "secondaryPositions": [
      "Goalkeeper"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "bio": "Athletic keeper with great positioning, aggressive command in the 18-yard box, and composure under high attacking pressure.",
    "commitment": "Uncommitted",
    "contactEmail": "mayaonalfo@gmail.com",
    "profileDocUrl": "Maya Onalfo Profile.pdf",
    "awards": [
      "NorCal State Pool Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "saves": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p8",
    "name": "Amaya Espinoza",
    "jerseyNumber": 8,
    "primaryPosition": "Forward",
    "specificPosition": "Forward / Winger (LW/RW)",
    "secondaryPositions": [
      "Attacking Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'7\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.95",
    "photoUrl": "https://i.imgur.com/9bM3Tr1.jpeg",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL All-Conference Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Milpitas, CA"
  },
  {
    "id": "p9",
    "name": "Quinn Mozdean",
    "jerseyNumber": 9,
    "primaryPosition": "Forward",
    "specificPosition": "Striker / Center Forward (CF #9)",
    "secondaryPositions": [
      "Winger"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "weight": "145 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/fxGV8qB.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "quinnmp2@gmail.com",
    "profileDocUrl": "Quinn Mozdean Player Profile.pdf",
    "awards": [
      "ECNL NorCal Top Goalscorer Candidate",
      "Surf Cup Best XI"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Saratoga, CA"
  },
  {
    "id": "p10",
    "name": "Ellie Tarabichi",
    "jerseyNumber": 10,
    "primaryPosition": "Forward",
    "specificPosition": "Forward / Winger (RW/LW)",
    "secondaryPositions": [
      "Attacking Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "weight": "130 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/F9OMlVL.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "ellietarabich@gmail.com",
    "profileDocUrl": "Ellie Tarabichi Player Profile.pdf",
    "awards": [
      "ECNL NorCal All-Conference First Team Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Mountain View, CA"
  },
  {
    "id": "p11",
    "name": "Sienna Ranaweera",
    "jerseyNumber": 11,
    "primaryPosition": "Midfielder",
    "specificPosition": "Attacking Midfielder / Playmaker (CAM #10)",
    "secondaryPositions": [
      "Winger",
      "Central Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'2\"",
    "dominantFoot": "Both",
    "highSchool": "Bay Area High School",
    "gpa": "4.17",
    "photoUrl": "https://i.imgur.com/nu130xn.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "siennaranaweera@gmail.com",
    "profileDocUrl": "Sienna Ranaweera Player Profile.pdf",
    "awards": [
      "ECNL Best Midfielder Candidate",
      "Olympic Development Program (ODP)"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Palo Alto, CA"
  },
  {
    "id": "p12",
    "name": "Yoonwoo Kim",
    "jerseyNumber": 12,
    "primaryPosition": "Midfielder",
    "specificPosition": "Central Midfielder (CM #8)",
    "secondaryPositions": [
      "Defensive Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "weight": "120 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/bNtd5dL.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "yoonrosesweet@gmail.com",
    "profileDocUrl": "Yoonwoo Kim Player Profile (1).pdf",
    "awards": [
      "ECNL Midfield General"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Santa Clara, CA"
  },
  {
    "id": "p13",
    "name": "Parker Cossey",
    "jerseyNumber": 13,
    "primaryPosition": "Midfielder",
    "specificPosition": "Box-to-Box Midfielder (CM)",
    "secondaryPositions": [
      "Defensive Midfielder",
      "Fullback"
    ],
    "gradYear": 2030,
    "birthYear": 2011,
    "height": "5'4\"",
    "weight": "110 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "contactEmail": "parkercossey2030@gmail.com",
    "profileDocUrl": "Parker Cossey Player Profile (1).pdf",
    "awards": [
      "ECNL Rising Star"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Campbell, CA"
  },
  {
    "id": "p14",
    "name": "Marley Dorsey",
    "jerseyNumber": 14,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back / Fullback (CB/LB)",
    "secondaryPositions": [
      "Defensive Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.86",
    "photoUrl": "https://i.imgur.com/OWHGLWq.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "marleydorsey@gmail.com",
    "profileDocUrl": "MarleyDorsey playerprofile.pdf",
    "awards": [
      "ECNL NorCal Defensive Honors"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p18",
    "name": "Ella Harris",
    "jerseyNumber": 18,
    "primaryPosition": "Midfielder",
    "specificPosition": "Central Midfielder (CM)",
    "secondaryPositions": [
      "Attacking Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL NorCal Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Cupertino, CA"
  },
  {
    "id": "p21",
    "name": "Sasha Landsdorf",
    "jerseyNumber": 21,
    "primaryPosition": "Midfielder",
    "specificPosition": "Defensive / Holding Midfielder (CDM #6)",
    "secondaryPositions": [
      "Central Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'7\"",
    "weight": "125 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "contactEmail": "sashal.soccer@gmail.com",
    "profileDocUrl": "Sasha Landsdorf Player Profile.pdf",
    "awards": [
      "ECNL All-Conference Selection",
      "Olympic Development Program"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Los Altos, CA"
  },
  {
    "id": "p22",
    "name": "Mia Tally",
    "jerseyNumber": 22,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back / Backline Captain (CB #4/#5)",
    "secondaryPositions": [
      "Right Back",
      "Defensive Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.93",
    "photoUrl": "https://i.imgur.com/AqxihGX.jpeg",
    "commitment": "Uncommitted",
    "ncaaId": "250198422",
    "contactEmail": "miatally.soccer@gmail.com",
    "profileDocUrl": "Mia Tally #22 Player Profile.pdf",
    "highlightsUrl": "https://www.youtube.com",
    "awards": [
      "Team Captain",
      "ECNL NorCal Defensive MVP Candidate",
      "Surf Cup Best XI Defender"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "isCaptain": true,
    "hometown": "Cupertino, CA"
  },
  {
    "id": "p24",
    "name": "Camille Chamberlain",
    "jerseyNumber": 24,
    "primaryPosition": "Forward",
    "specificPosition": "Forward / Winger (LW/RW/ST)",
    "secondaryPositions": [
      "Center Forward"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/mEo0r5F.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "mack.turf.15@gmail.com",
    "profileDocUrl": "Mack Chamberlain Player Card.pdf",
    "awards": [
      "ECNL NorCal First Team Attacker Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Sunnyvale, CA"
  },
  {
    "id": "p25",
    "name": "Emma Holtz",
    "jerseyNumber": 25,
    "primaryPosition": "Defender",
    "specificPosition": "Outside Back / Fullback (LB/RB)",
    "secondaryPositions": [
      "Wingback"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'5\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.80",
    "photoUrl": "https://i.imgur.com/2leh7W5.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "emmaholtz25@gmail.com",
    "profileDocUrl": "Emma Holtz #25 (1).pdf",
    "awards": [
      "ECNL NorCal Honors"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Mateo, CA"
  },
  {
    "id": "p26",
    "name": "Sakura Kapla",
    "jerseyNumber": 26,
    "primaryPosition": "Midfielder",
    "specificPosition": "Attacking Midfielder / Winger",
    "secondaryPositions": [
      "Forward",
      "Central Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "weight": "125 lbs",
    "dominantFoot": "Both",
    "highSchool": "Bay Area High School",
    "gpa": "4.17",
    "photoUrl": "https://i.imgur.com/aTnMjDm.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "sakurakapla@gmail.com",
    "profileDocUrl": "Sakura Kapla #26 Profile.pdf",
    "awards": [
      "ECNL Top Playmaker",
      "Surf Cup Standout"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p28",
    "name": "Jessica Teixeira",
    "jerseyNumber": 28,
    "primaryPosition": "Goalkeeper",
    "specificPosition": "Goalkeeper (GK)",
    "secondaryPositions": [
      "Goalkeeper"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL Clean Sheet Leader",
      "Golden Glove Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "saves": 0,
      "minutesPlayed": 0
    },
    "hometown": "Fremont, CA"
  },
  {
    "id": "p32",
    "name": "Kayla Halada",
    "jerseyNumber": 32,
    "primaryPosition": "Forward",
    "specificPosition": "Forward / Winger (RW/LW)",
    "secondaryPositions": [
      "Striker"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'3\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/FCXUDDf.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "Kaylahaladasoccer@gmail.com",
    "profileDocUrl": "Kayla Halada Profile.pdf",
    "awards": [
      "ECNL NorCal Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Morgan Hill, CA"
  },
  {
    "id": "p46",
    "name": "Isabella Gagni",
    "jerseyNumber": 46,
    "primaryPosition": "Forward",
    "specificPosition": "Winger / Attacker (LW/RW)",
    "secondaryPositions": [
      "Forward"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'2\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.70",
    "photoUrl": "https://i.imgur.com/z82Kr8e.jpeg",
    "commitment": "Uncommitted",
    "contactEmail": "Rgagni95037@yahoo.com",
    "profileDocUrl": "Isabella Gagni Profile.pdf",
    "awards": [
      "ECNL Wide Playmaker"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Morgan Hill, CA"
  },
  {
    "id": "p88",
    "name": "Anava Armanino",
    "jerseyNumber": 88,
    "primaryPosition": "Forward",
    "specificPosition": "Winger / Midfielder (RW/RM)",
    "secondaryPositions": [
      "Forward",
      "Attacking Midfielder"
    ],
    "gradYear": 2031,
    "birthYear": 2011,
    "height": "5'9\"",
    "weight": "120 lbs",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "contactEmail": "anavaarmanino@gmail.com",
    "profileDocUrl": "Anava Armanino Profile.pdf",
    "awards": [
      "Next-Gen ECNL Prospect"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p15",
    "name": "Clara Chen",
    "jerseyNumber": 15,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back / Fullback (CB)",
    "secondaryPositions": [
      "Right Back"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'7\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.15",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL Defensive Pool"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Cupertino, CA"
  },
  {
    "id": "p17",
    "name": "Avery Johnson",
    "jerseyNumber": 17,
    "primaryPosition": "Midfielder",
    "specificPosition": "Central Midfielder (CM/LM)",
    "secondaryPositions": [
      "Left Midfielder"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'6\"",
    "dominantFoot": "Left",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL Midfield Candidate"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Palo Alto, CA"
  },
  {
    "id": "p19",
    "name": "Brooke Davis",
    "jerseyNumber": 19,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back / Sweeper",
    "secondaryPositions": [
      "Fullback"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'8\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "3.95",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL Backline Standout"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Los Gatos, CA"
  },
  {
    "id": "p20",
    "name": "Natalie Morales",
    "jerseyNumber": 20,
    "primaryPosition": "Forward",
    "specificPosition": "Forward / Attacking Mid (ST/CAM)",
    "secondaryPositions": [
      "Winger"
    ],
    "gradYear": 2029,
    "birthYear": 2010,
    "height": "5'5\"",
    "dominantFoot": "Both",
    "highSchool": "Bay Area High School",
    "gpa": "4.10",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [
      "ECNL Offensive Spark"
    ],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "Santa Clara, CA"
  },
  {
    "id": "p27",
    "name": "Placeholder Player 1",
    "jerseyNumber": 98,
    "primaryPosition": "Midfielder",
    "specificPosition": "Central Midfielder",
    "secondaryPositions": [],
    "gradYear": 2029,
    "birthYear": 2011,
    "height": "5'5\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  },
  {
    "id": "p29",
    "name": "Placeholder Player 2",
    "jerseyNumber": 99,
    "primaryPosition": "Defender",
    "specificPosition": "Center Back",
    "secondaryPositions": [],
    "gradYear": 2029,
    "birthYear": 2011,
    "height": "5'6\"",
    "dominantFoot": "Right",
    "highSchool": "Bay Area High School",
    "gpa": "4.00",
    "photoUrl": "https://i.imgur.com/c0qeiY4.png",
    "commitment": "Uncommitted",
    "awards": [],
    "stats": {
      "appearances": 0,
      "starts": 0,
      "goals": 0,
      "assists": 0,
      "cleanSheets": 0,
      "minutesPlayed": 0
    },
    "hometown": "San Jose, CA"
  }
];
export const INITIAL_MATCHES: Match[] = [
  {
    "id": "m1094381",
    "date": "2026-08-22",
    "time": "10:00 AM PST",
    "opponent": "Marin FC ECNL G2010/11",
    "opponentLocation": "Marin County, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "fieldNumber": "Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+San+Jose+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid (Blue/Red Accents)",
    "awayKitColor": "Black-Solid",
    "gameNotes": "ECNL NorCal Season Opener. Kickoff at John Mise Field #1.",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094423",
    "date": "2026-08-29",
    "time": "11:00 AM PST",
    "opponent": "Mustang SC ECNL G2010/11",
    "opponentLocation": "Danville, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Mustang Soccer Complex",
    "address": "4680 Camino Tassajara, Danville, CA 94506",
    "mapUrl": "https://maps.google.com/?q=Mustang+Soccer+Complex+Danville+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "gameNotes": "Bay Area Rivalry matchday at Mustang SC.",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094453",
    "date": "2026-08-30",
    "time": "12:00 PM PST",
    "opponent": "Placer United ECNL G2010/11",
    "opponentLocation": "Roseville, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094477",
    "date": "2026-09-12",
    "time": "02:00 PM PST",
    "opponent": "COSC ECNL G2010/11",
    "opponentLocation": "Fresno, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Edison High School Fields - Field 1",
    "address": "540 E California Ave, Fresno, CA 93706",
    "mapUrl": "https://maps.google.com/?q=Edison+High+School+Fresno+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094519",
    "date": "2026-09-19",
    "time": "11:00 AM PST",
    "opponent": "MVLA ECNL G2010/11",
    "opponentLocation": "Mountain View / Los Altos, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "gameNotes": "Silicon Valley Derby vs MVLA.",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094579",
    "date": "2026-09-20",
    "time": "01:00 PM PST",
    "opponent": "San Juan SC ECNL G2010/11",
    "opponentLocation": "Rancho Cordova, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "San Juan Soccer Complex",
    "address": "3151 Kilgore Rd, Rancho Cordova, CA 95670",
    "mapUrl": "https://maps.google.com/?q=San+Juan+Soccer+Complex+Rancho+Cordova+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094591",
    "date": "2026-09-26",
    "time": "10:00 AM PST",
    "opponent": "Bay Area Surf ECNL G2010/11",
    "opponentLocation": "San Jose, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094627",
    "date": "2026-09-27",
    "time": "12:00 PM PST",
    "opponent": "Davis Legacy ECNL G2010/11",
    "opponentLocation": "Davis, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094669",
    "date": "2026-10-03",
    "time": "11:00 AM PST",
    "opponent": "Stanislaus Surf ECNL G2010/11",
    "opponentLocation": "Modesto, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094723",
    "date": "2026-10-17",
    "time": "01:00 PM PST",
    "opponent": "Santa Rosa United ECNL G2010/11",
    "opponentLocation": "Santa Rosa, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Trione Fields - Trione East",
    "address": "4400 Old Redwood Hwy, Santa Rosa, CA 95403",
    "mapUrl": "https://maps.google.com/?q=Trione+Fields+Santa+Rosa+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094741",
    "date": "2026-10-24",
    "time": "10:00 AM PST",
    "opponent": "Pleasanton RAGE ECNL G2010/11",
    "opponentLocation": "Pleasanton, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094771",
    "date": "2026-10-25",
    "time": "10:40 AM PST",
    "opponent": "Marin FC ECNL G2010/11",
    "opponentLocation": "Kentfield, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "College of Marin - Stadium",
    "address": "835 College Ave, Kentfield, CA 94904",
    "mapUrl": "https://maps.google.com/?q=College+of+Marin+Kentfield+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094807",
    "date": "2026-10-31",
    "time": "11:00 AM PST",
    "opponent": "COSC ECNL G2010/11",
    "opponentLocation": "Fresno, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094855",
    "date": "2026-11-07",
    "time": "01:00 PM PST",
    "opponent": "MVLA ECNL G2010/11",
    "opponentLocation": "Mountain View, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Mountain View High School Stadium",
    "address": "3535 Truman Ave, Mountain View, CA 94040",
    "mapUrl": "https://maps.google.com/?q=Mountain+View+High+School+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094891",
    "date": "2027-03-20",
    "time": "02:00 PM PST",
    "opponent": "Placer United ECNL G2010/11",
    "opponentLocation": "Roseville, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Placer Valley Soccer Complex - Field 5",
    "address": "2601 Gibson Dr, Roseville, CA 95747",
    "mapUrl": "https://maps.google.com/?q=Placer+Valley+Soccer+Complex+Roseville+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094921",
    "date": "2027-03-21",
    "time": "11:00 AM PST",
    "opponent": "Mustang SC ECNL G2010/11",
    "opponentLocation": "Danville, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094951",
    "date": "2027-04-10",
    "time": "12:00 PM PST",
    "opponent": "San Juan SC ECNL G2010/11",
    "opponentLocation": "Rancho Cordova, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1094993",
    "date": "2027-04-17",
    "time": "10:00 AM PST",
    "opponent": "Davis Legacy ECNL G2010/11",
    "opponentLocation": "Davis, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Davis Legacy Soccer Complex - Field 9",
    "address": "26345 County Road 105, Davis, CA 95618",
    "mapUrl": "https://maps.google.com/?q=Davis+Legacy+Soccer+Complex+Davis+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1095023",
    "date": "2027-04-18",
    "time": "01:00 PM PST",
    "opponent": "Bay Area Surf ECNL G2010/11",
    "opponentLocation": "San Jose, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Twin Creeks Sports Complex",
    "address": "969 E Caribbean Dr, Sunnyvale, CA 94089",
    "mapUrl": "https://maps.google.com/?q=Twin+Creeks+Sunnyvale+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1095089",
    "date": "2027-04-24",
    "time": "12:50 PM PST",
    "opponent": "Stanislaus Surf ECNL G2010/11",
    "opponentLocation": "Modesto, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Thomas Downey High School - Field 1",
    "address": "1000 Coffee Rd, Modesto, CA 95355",
    "mapUrl": "https://maps.google.com/?q=Downey+High+School+Modesto+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1095101",
    "date": "2027-05-01",
    "time": "11:00 AM PST",
    "opponent": "Santa Rosa United ECNL G2010/11",
    "opponentLocation": "Santa Rosa, CA",
    "isHome": true,
    "competition": "ECNL Northern California",
    "venue": "John Mise Field - Field 1",
    "address": "1125 Saratoga Ave, Cupertino, CA 95129",
    "mapUrl": "https://maps.google.com/?q=John+Mise+Park+Cupertino+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams"
  },
  {
    "id": "m1095149",
    "date": "2027-05-08",
    "time": "12:00 PM PST",
    "opponent": "Pleasanton RAGE ECNL G2010/11",
    "opponentLocation": "Pleasanton, CA",
    "isHome": false,
    "competition": "ECNL Northern California",
    "venue": "Patelco Sports Complex",
    "address": "Bernal Ave, Pleasanton, CA 94566",
    "mapUrl": "https://maps.google.com/?q=Patelco+Sports+Complex+Pleasanton+CA",
    "status": "upcoming",
    "homeKitColor": "White-Solid",
    "awayKitColor": "Black-Solid",
    "videoLiveStreamUrl": "https://youtube.com/@TheECNL/streams",
    "gameNotes": "ECNL NorCal Regular Season Finale."
  }
];
export const INITIAL_STANDINGS: StandingTeam[] = [
  {
    "rank": 1,
    "teamName": "De Anza Force U16 ECNL",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 41,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": true
  },
  {
    "rank": 2,
    "teamName": "MVLA ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 30,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 3,
    "teamName": "Bay Area Surf ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 25,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 4,
    "teamName": "Mustang SC ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 17,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 5,
    "teamName": "Davis Legacy ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 9,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 6,
    "teamName": "San Juan SC ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": 4,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 7,
    "teamName": "Pleasanton RAGE ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -3,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 8,
    "teamName": "Marin FC ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -7,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 9,
    "teamName": "Santa Rosa United ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -16,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 10,
    "teamName": "Placer United ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -22,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 11,
    "teamName": "Stanislaus Surf ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -33,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  },
  {
    "rank": 12,
    "teamName": "COSC ECNL G2010/11",
    "played": 0,
    "won": 0,
    "drawn": 0,
    "lost": 0,
    "goalsFor": 0,
    "goalsAgainst": 0,
    "goalDifference": -46,
    "points": 0,
    "pointsPerGame": 0,
    "form": [],
    "isCurrentTeam": false
  }
];
export const INITIAL_COACHES: Coach[] = [
  {
    "id": "c1",
    "name": "Lloyd Grist",
    "role": "Head Coach",
    "license": "USSF A-Senior National License / UEFA Licensed",
    "experience": "12+ Years Elite Youth Development & ECNL National Championships",
    "email": "lloydgrist@gmail.com",
    "phone": "(408) 555-0142",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    "bio": "Head Coach of De Anza Force U16G ECNL. Committed to developing high-IQ technical players prepared for the highest levels of collegiate and national team soccer.",
    "almaMater": "De Anza Force Academy Director"
  },
  {
    "id": "c-yuta",
    "name": "Yuta Nomura",
    "role": "Assistant Coach / Technical Staff",
    "license": "USSF Licensed Coach",
    "experience": "Elite Youth Development & Tactical Analysis",
    "email": "yuta.nomura@deanzaforce.org",
    "phone": "(408) 555-0164",
    "photoUrl": "https://i.imgur.com/iNiPnJD.jpeg",
    "bio": "Assistant Coach for De Anza Force U16G ECNL. Specializes in tactical film review, individualized player technique, and match-day preparation."
  },
  {
    "id": "c2",
    "name": "Nina Wang",
    "role": "Team Administrator & Manager",
    "license": "Team Operations Director",
    "experience": "ECNL Club Operations & Tournament Logistics",
    "email": "ninacwang@gmail.com",
    "phone": "(408) 555-0189",
    "photoUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    "bio": "Coordinates all team travel logistics, ECNL match rosters, tournament registration, and parent liaison communications."
  },
  {
    "id": "c3",
    "name": "Paul Holocher",
    "role": "Technical Director & College Recruiting Coordinator",
    "license": "USSF Pro License",
    "experience": "20+ Years NCAA D1 Head Coach & Pro Academy Director",
    "email": "paul.holocher@deanzaforce.org",
    "phone": "(408) 555-0199",
    "photoUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    "bio": "Oversees tactical curriculum and serves as primary liaison for college coaching staffs across NCAA Division I, II, III and NAIA programs."
  },
  {
    "id": "c4",
    "name": "Mark Henderson",
    "role": "Goalkeeper Specialist Coach",
    "license": "USSF National Goalkeeping License",
    "experience": "Former Collegiate & Pro GK Coach",
    "email": "gk@deanzaforce.org",
    "phone": "(408) 555-0155",
    "photoUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    "bio": "Dedicated goalkeeper training specialist emphasizing explosive footwork, 1v1 angles, cross distribution, and modern sweeping."
  }
];

export const DEFAULT_ACTION_PHOTOS = [
  {
    "id": "photo-1",
    "url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1600&auto=format&fit=crop&q=80",
    "title": "ECNL Championship Match Action",
    "subtitle": "High-tempo possession and attacking pressure in the Northern California Conference",
    "tag": "Matchday Action",
    "date": "Spring 2026"
  },
  {
    "id": "photo-2",
    "url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1600&auto=format&fit=crop&q=80",
    "title": "Goalkeeper Set-Piece Save",
    "subtitle": "Decisive defensive stop during national showcase play in San Diego",
    "tag": "Defensive Stand",
    "date": "National Showcase"
  },
  {
    "id": "photo-3",
    "url": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1600&auto=format&fit=crop&q=80",
    "title": "Midfield Transition & Playmaking",
    "subtitle": "Technical combination passing through midfield lines",
    "tag": "Tactical Play",
    "date": "NorCal League"
  },
  {
    "id": "photo-4",
    "url": "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&auto=format&fit=crop&q=80",
    "title": "Team Huddle & Unity",
    "subtitle": "De Anza Force squad preparation before kickoff at De Anza Stadium",
    "tag": "Team Spirit",
    "date": "Pre-Match"
  },
  {
    "id": "photo-5",
    "url": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1600&auto=format&fit=crop&q=80",
    "title": "Goal Celebration & Victory",
    "subtitle": "Final whistle celebrations after securing top seed honors",
    "tag": "Celebration",
    "date": "Champions League"
  },
  {
    "id": "photo-6",
    "url": "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1600&auto=format&fit=crop&q=80",
    "title": "Precision Finishing on Goal",
    "subtitle": "Top-corner strike on the counter-attack",
    "tag": "Scoring Highlight",
    "date": "ECNL NorCal"
  }
];
export const DEFAULT_GOOGLE_PHOTOS_ALBUMS = [
  {
    "id": "album-1",
    "title": "ECNL Northern California Season Action",
    "subtitle": "Official match photography, game action, defensive stops & scoring celebrations.",
    "albumUrl": "https://linktr.ee/willow_glen_photography",
    "coverImageUrl": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
    "date": "Spring 2026 Season",
    "photoCount": "150+ Photos",
    "badge": "Matchday"
  },
  {
    "id": "album-2",
    "title": "Surf Cup Champions & Showcase Action",
    "subtitle": "Championship celebration, trophy presentation, and tournament highlights.",
    "albumUrl": "https://linktr.ee/willow_glen_photography",
    "coverImageUrl": "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80",
    "date": "Tournament Series",
    "photoCount": "80+ Photos",
    "badge": "Tournament"
  }
];
export const DEFAULT_MASTER_ALBUM_INFO = {
  "url": "https://linktr.ee/willow_glen_photography",
  "title": "Willow Glen Photography • Team Photo Hub",
  "subtitle": "Official team matchday albums, high-resolution tournament archives, and downloadable player galleries.",
  "photographerName": "Willow Glen Photography",
  "badge": "Master Album Hub"
};

export const INITIAL_TOURNAMENTS = [
  {
    "id": "t1",
    "title": "Surf Cup Best of the Best",
    "year": "2026/2027",
    "placement": "Finalists",
    "location": "San Diego, CA",
    "division": "Super White National Division"
  },
  {
    "id": "t2",
    "title": "ECNL Girls National Playoffs",
    "year": "2026",
    "placement": "National Quarterfinalists",
    "location": "Seattle, WA",
    "division": "ECNL Champions League"
  },
  {
    "id": "t3",
    "title": "ECNL Phoenix National Showcase",
    "year": "2026",
    "placement": "Group Champions (3-0-0)",
    "location": "Phoenix, AZ",
    "division": "Showcase National Flight"
  },
  {
    "id": "t4",
    "title": "SilverLakes College Showcase",
    "year": "2026",
    "placement": "Champions",
    "location": "Norco, CA",
    "division": "Top College Flight"
  },
  {
    "id": "t5",
    "title": "NorCal State Cup",
    "year": "2026",
    "placement": "State Champions",
    "location": "Davis, CA",
    "division": "State Premier Division"
  }
];
