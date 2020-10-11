import { ITeamCard } from 'common/models/schedule/teams';

export interface IMatchup {
  id: string;
  assignedGameId: number | null;
  homeTeamId: string;
  awayTeamId: string;
  divisionId: string;
  divisionHex: string;
  divisionName: string;
  awayTeam?: ITeamCard;
  homeTeam?: ITeamCard;
}

export interface IMatchupTeam {
  id: string;
  name: string;
  poolId: string;
}

export interface ITableRunningTally {
  teamId: string;
  teamName: string;
  homeGamesNumber: number;
  awayGamesNumber: number;
  allGamesNumber: number;
}
