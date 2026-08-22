import { Player, Match, StandingTeam, Coach, TeamInfo, ActionPhoto, GooglePhotosAlbum, MasterAlbumInfo } from './src/types';
export type SaveAllData = {
  players: Player[];
  matches: Match[];
  standings: StandingTeam[];
  coaches: Coach[];
  teamInfo: TeamInfo;
  actionPhotos?: ActionPhoto[];
  googlePhotosAlbums?: GooglePhotosAlbum[];
  masterAlbumInfo?: MasterAlbumInfo;
};
