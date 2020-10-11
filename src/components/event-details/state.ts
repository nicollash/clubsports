import { getVarcharEight } from 'helpers';
import { RankingFactorValues } from 'common/enums';

const defaultRankingFactor = [
  { id: RankingFactorValues.WIN_PERCENTAGE, text: 'Win Percentage' },
  { id: RankingFactorValues.HEAD_TO_HEAD, text: 'Head to Head' },
  { id: RankingFactorValues.GOAL_DIFFERENCE, text: 'Goal Difference' },
  { id: RankingFactorValues.GOAL_SCORED, text: 'Goals Scored' },
  { id: RankingFactorValues.GOAL_ALLOWED, text: 'Goals Allowed' },
];

const DEFAULT_RANKING_VALUE = JSON.stringify(
  defaultRankingFactor.map(factor => factor.id)
);

const eventState = () => ({
  event_id: getVarcharEight(),
  sport_id: 1,
  org_id: '',
  event_name: '',
  event_description: '',
  main_contact: null,
  main_contact_mobile: null,
  main_contact_email: null,
  event_startdate: new Date().toISOString(),
  event_enddate: new Date().toISOString(),
  time_zone_utc: -5,
  event_tag: '',
  event_level: 'Other',
  event_format_id: 0,
  first_game_time: '08:30:00',
  last_game_end: '17:30:00',
  primary_location_desc: '',
  period_duration: '',
  periods_per_game: 2,
  exclusive_time_ranges_YN: 0,
  tie_breaker_format_id: 0,
  min_num_of_games: undefined,
  max_num_of_divisions: undefined,
  assoc_docs_URL: '',
  division_id: undefined,
  ranking_factor_divisions: DEFAULT_RANKING_VALUE,
  ranking_factor_pools: DEFAULT_RANKING_VALUE,
  is_active_YN: 0,
  is_published_YN: 0,
});

enum UploadLogoTypes {
  MOBILE = 'mobile_icon_URL',
  DESKTOP = 'desktop_icon_URL',
}

export { defaultRankingFactor, eventState, UploadLogoTypes };
