import { ITeam, IPool } from 'common/models';

const mapTeamWithUnassignedTeams = (
  team: ITeam[],
  unassignedTeams: ITeam[]
) => {
  const mappedTeams = team.map(team => {
    const currentTeam = unassignedTeams.find(
      unassignedTeam => unassignedTeam.team_id === team.team_id
    );

    return currentTeam || team;
  });

  return mappedTeams;
};

const getUnassignedTeamsByPool = (pool: IPool, teams: ITeam[]) => {
  const unassignedTeam = teams.reduce((acc, it) => {
    return it.pool_id === pool.pool_id
      ? [
          ...acc,
          {
            ...it,
            pool_id: null,
          },
        ]
      : [...acc, it];
  }, [] as ITeam[]);

  return unassignedTeam;
};

export { mapTeamWithUnassignedTeams, getUnassignedTeamsByPool };
