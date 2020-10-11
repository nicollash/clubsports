import { ITeam as IFetchedTeam, IDivision, IFacility } from 'common/models';
import { ITeam } from 'common/models/schedule/teams';
import { IField as IFetchedField } from 'common/models/field';
import { IField } from 'common/models/schedule/fields';
import { IFacility as IFetchedFacility } from 'common/models';
import { IScheduleDivision } from 'common/models/schedule/divisions';

const teamPremierByDivision = (team: IFetchedTeam, divisions: IDivision[]) => {
  const division = divisions.find(
    element => element.division_id === team.division_id
  );
  if (!division) return false;
  return Boolean(division.is_premier_YN);
};

const getDivisionValueByTeamId = (
  divisions: IDivision[],
  divisionId: string,
  key: string
) => {
  const division = divisions.find(
    element => element.division_id === divisionId
  );
  return division ? division[key] : undefined;
};

const getTeamDivisionHex = (team: IFetchedTeam, divisions: IDivision[]) => {
  const hex = getDivisionValueByTeamId(
    divisions,
    team.division_id!,
    'division_hex'
  );

  return hex ? `#${hex}` : undefined;
};

export const mapTeamsData = (teams: IFetchedTeam[], divisions: IDivision[]) => {
  let mappedTeams: ITeam[];

  mappedTeams = teams.map(team => ({
    id: team.team_id,
    name: team.short_name,
    startTime: '08:00:00',
    poolId: team.pool_id,
    teamPhoneNum: team.phone_num,
    contactFirstName: team.contact_first_name,
    contactLastName: team.contact_last_name,
    divisionId: team.division_id!,
    divisionShortName: getDivisionValueByTeamId(
      divisions,
      team.division_id!,
      'short_name'
    ),
    divisionHex: getTeamDivisionHex(team, divisions),
    isPremier: teamPremierByDivision(team, divisions),
  }));

  return mappedTeams;
};

export const mapFieldsData = (
  fields: IFetchedField[],
  facilities: IFacility[]
) => {
  let mappedFields: IField[];

  mappedFields = fields.map(field => ({
    id: field.field_id,
    facilityId: field.facilities_id,
    facilityName: facilities.find(
      item => item.facilities_id === field.facilities_id
    )?.facilities_abbr!,
    name: field.field_name,
    isPremier: Boolean(field.is_premier_YN),
  }));

  return mappedFields;
};

export const mapFacilitiesData = (facilities: IFetchedFacility[]) => {
  const mappedFacilities = facilities.map(facility => ({
    id: facility.facilities_id,
    name: facility.facilities_description,
    abbr: facility.facilities_abbr,
    fields: facility.num_fields,
  }));

  return mappedFacilities;
};

export const mapDivisionsData = (divisions: IDivision[]) => {
  const mappedDivisions: IScheduleDivision[] = divisions.map(division => ({
    id: division.division_id,
    name: division.short_name,
    isPremier: Boolean(division.is_premier_YN),
    preferredFacilityId: Boolean(division.plays_at_spec_facility) ? division.spec_facilities_id : undefined,
  }));

  return mappedDivisions;
};
