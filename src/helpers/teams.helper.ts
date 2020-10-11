import {
  ITeam,
  ISchedulesGame,
  ITeamWithResults,
  ISchedulesGameWithNames,
  IScoringSetting,
} from 'common/models';
import { RankingFactorValues } from 'common/enums';

const countMatchScore = (
  prevValue: undefined | number,
  teamOneScore: null | string | number,
  teamTwoScore: null | string | number
) => {
  let score = prevValue || 0;
  const scoreOne = Number(teamOneScore);
  const scoreTwo = Number(teamTwoScore);

  if (scoreOne > scoreTwo) {
    score++;
  }

  return score;
};

const countTeamScore = (
  prevValue: undefined | number,
  teamScore: null | string | number
) => {
  let scoreValue = prevValue || 0;

  const score = Number(teamScore);

  scoreValue += score;

  return scoreValue;
};

const countTie = (
  prevValue: undefined | number,
  teamOneScore: null | string | number,
  teamTwoScore: null | string | number
) => {
  let tie = prevValue || 0;

  if (
    Number(teamOneScore) > 0 &&
    Number(teamTwoScore) > 0 &&
    teamOneScore === teamTwoScore
  ) {
    tie++;
  }

  return tie;
};

const countGoalDifferential = (
  scoringSettings: IScoringSetting,
  prevValue: undefined | number,
  teamOneScore: null | string | number,
  teamTwoScore: null | string | number
) => {
  let scoreValue = prevValue || 0;

  const differentialScore = Number(teamOneScore) - Number(teamTwoScore);

  if (scoringSettings.maxGoalDifferential === null) {
    scoreValue = scoreValue + differentialScore;

    return scoreValue;
  }

  let increment = differentialScore;

  if (
    increment < 0 &&
    Math.abs(increment) > scoringSettings.maxGoalDifferential
  ) {
    increment = -scoringSettings.maxGoalDifferential;
  } else if (
    increment >= 0 &&
    increment > scoringSettings.maxGoalDifferential
  ) {
    increment = scoringSettings.maxGoalDifferential;
  }

  scoreValue = scoreValue + increment;

  return scoreValue;
};

const getTeamsWithResults = (
  teams: ITeam[],
  games: ISchedulesGame[],
  scoringSettings: IScoringSetting
): ITeamWithResults[] => {
  const localTeams = [...teams] as ITeamWithResults[];

  games?.forEach(game => {
    const awayTeamIdx = localTeams.findIndex(
      team => team.team_id === game.away_team_id
    );

    const homeTeamIdx = localTeams.findIndex(
      team => team.team_id === game.home_team_id
    );

    if (awayTeamIdx >= 0) {
      const awayTeam = localTeams[awayTeamIdx];

      localTeams[awayTeamIdx] = {
        ...awayTeam,
        wins: countMatchScore(
          awayTeam.wins,
          game.away_team_score,
          game.home_team_score
        ),
        losses: countMatchScore(
          awayTeam.losses,
          game.home_team_score,
          game.away_team_score
        ),
        tie: countTie(awayTeam.tie, game.home_team_score, game.away_team_score),
        goalsScored: countTeamScore(awayTeam.goalsScored, game.away_team_score),
        goalsAllowed: countTeamScore(
          awayTeam.goalsAllowed,
          game.home_team_score
        ),
        goalsDifferential: countGoalDifferential(
          scoringSettings,
          awayTeam.goalsDifferential,
          game.away_team_score,
          game.home_team_score
        ),
      };
    }

    if (homeTeamIdx >= 0) {
      const homeTeam = localTeams[homeTeamIdx];

      localTeams[homeTeamIdx] = {
        ...homeTeam,
        wins: countMatchScore(
          homeTeam.wins,
          game.home_team_score,
          game.away_team_score
        ),
        losses: countMatchScore(
          homeTeam.losses,
          game.away_team_score,
          game.home_team_score
        ),
        tie: countTie(homeTeam.tie, game.home_team_score, game.away_team_score),
        goalsScored: countTeamScore(homeTeam.goalsScored, game.home_team_score),
        goalsAllowed: countTeamScore(
          homeTeam.goalsAllowed,
          game.away_team_score
        ),
        goalsDifferential: countGoalDifferential(
          scoringSettings,
          homeTeam.goalsDifferential,
          game.home_team_score,
          game.away_team_score
        ),
      };
    }
  });

  return localTeams;
};

const sortTeamsByBestRecord = (
  a: ITeamWithResults,
  b: ITeamWithResults,
  _: unknown
) => {
  const sortedTeams =
    (b.wins+ 0.5 * b.tie) / (b.wins + b.tie + b.losses) - (a.wins+ 0.5 * a.tie) / (a.wins + a.tie + a.losses);

  return sortedTeams;
};

const sortTeamsByHeadToHead = (
  a: ITeamWithResults,
  b: ITeamWithResults,
  games: ISchedulesGameWithNames[]
) => {
  const teamScores = games.reduce(
    (acc, game) => {
      if (
        (game.homeTeamId === a.team_id && game.awayTeamId === b.team_id) ||
        (game.homeTeamId === b.team_id && game.awayTeamId === a.team_id)
      ) {
        const gameTeamAScore =
          a.team_id === game.homeTeamId
            ? game.homeTeamScore
            : game.awayTeamScore;

        const gameTeamBScore =
          b.team_id === game.homeTeamId
            ? game.homeTeamScore
            : game.awayTeamScore;

        return {
          teamAScore: acc.teamAScore = acc.teamAScore + Number(gameTeamAScore),
          teamBScore: acc.teamBScore = acc.teamBScore + Number(gameTeamBScore),
        };
      }

      return acc;
    },
    { teamAScore: 0, teamBScore: 0 }
  );

  const sortedTeams = teamScores.teamBScore - teamScores.teamAScore;

  return sortedTeams;
};

const sortTeamsByGoalScored = (
  a: ITeamWithResults,
  b: ITeamWithResults,
  _: unknown
) => {
  const sortedTeams = b.goalsScored - a.goalsScored;

  return sortedTeams;
};

const sortTeamsByDifference = (
  a: ITeamWithResults,
  b: ITeamWithResults,
  _: unknown
) => {
  const sortedTeams =
    b.goalsScored - b.goalsAllowed - (a.goalsScored - a.goalsAllowed);

  return sortedTeams;
};

const sortTeamsByGoalAllowed = (
  a: ITeamWithResults,
  b: ITeamWithResults,
  _: unknown
) => {
  const sortedTeams = a.goalsAllowed - b.goalsAllowed;

  return sortedTeams;
};

const getFiltredTeamByResults = (teams: ITeamWithResults[]) => {
  const filtredTeamByResults = teams.reduce(
    (acc, teams) =>
      teams.wins > 0 || teams.losses > 0 || teams.tie > 0
        ? { ...acc, teamWithResults: [...acc.teamWithResults, teams] }
        : { ...acc, teamWithoutResults: [...acc.teamWithoutResults, teams] },
    {
      teamWithResults: [] as ITeamWithResults[],
      teamWithoutResults: [] as ITeamWithResults[],
    }
  );

  return filtredTeamByResults;
};

const SortTeamsBy = {
  [RankingFactorValues.WIN_PERCENTAGE]: sortTeamsByBestRecord,
  [RankingFactorValues.HEAD_TO_HEAD]: sortTeamsByHeadToHead,
  [RankingFactorValues.GOAL_ALLOWED]: sortTeamsByGoalAllowed,
  [RankingFactorValues.GOAL_DIFFERENCE]: sortTeamsByDifference,
  [RankingFactorValues.GOAL_SCORED]: sortTeamsByGoalScored,
};

const sortTeamByScored = (
  teams: ITeamWithResults[],
  games: ISchedulesGameWithNames[],
  rankings: string
) => {
  const parsedRankings = JSON.parse(rankings);

  if (parsedRankings.length !== Object.keys(RankingFactorValues).length / 2) {
    return teams;
  }

  const filtredTeamsByResults = getFiltredTeamByResults(teams);

  const sortedTeams = filtredTeamsByResults.teamWithResults.sort(
    (a, b) =>
      SortTeamsBy[parsedRankings[0]](a, b, games) ||
      SortTeamsBy[parsedRankings[1]](a, b, games) ||
      SortTeamsBy[parsedRankings[2]](a, b, games) ||
      SortTeamsBy[parsedRankings[3]](a, b, games) ||
      SortTeamsBy[parsedRankings[4]](a, b, games)
  );

  return [...sortedTeams, ...filtredTeamsByResults.teamWithoutResults];
};

export { getTeamsWithResults, sortTeamByScored };
