import {
  IEventDetails,
  IScoringSetting,
  ISchedulesGameWithNames,
} from 'common/models';

const getScoringSettings = (event: IEventDetails): IScoringSetting => {
  const scroingSetting = {
    hasGoalsScored: Boolean(event.show_goals_scored),
    hasGoalsAllowed: Boolean(event.show_goals_allowed),
    hasGoalsDifferential: Boolean(event.show_goals_diff),
    hasTies: Boolean(event.tie_breaker_format_id),
    maxGoalDifferential:
      event.max_goal_differential !== null
        ? Number(event.max_goal_differential)
        : null,
  };

  return scroingSetting;
};

const getGamesStatistics = (games: ISchedulesGameWithNames[]) => {
  const gamesStatistic = games.reduce(
    (acc, it) => {
      return {
        totalGames:
          it.awayTeamId || it.homeTeamId
            ? (acc.totalGames = acc.totalGames + 1)
            : acc.totalGames,
        completedGames:
          it.awayTeamScore !== null || it.homeTeamScore !== null
            ? (acc.completedGames = acc.completedGames + 1)
            : acc.completedGames,
      };
    },
    { totalGames: 0, completedGames: 0 }
  );

  return gamesStatistic;
};

export { getScoringSettings, getGamesStatistics };
