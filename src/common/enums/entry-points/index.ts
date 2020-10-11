enum EntryPoints {
  EVENTS = '/events',
  REGISTRATIONS = '/registrations',
  FACILITIES = '/facilities',
  DIVISIONS = '/divisions',
  POOLS = '/pools',
  TEAMS = '/teams',
  SCHEDULES = '/schedules',
}

enum EntryPointsWithId {
  EVENTS = '/events?event_id=',
  REGISTRATIONS = '/registrations?registration_id=',
  FACILITIES = '/facilities?facilities_id=',
  DIVISIONS = '/divisions?division_id=',
  POOLS = '/pools?pool_id=',
  TEAMS = '/teams?team_id=',
  SCHEDULES = '/schedules?schedule_id=',
}

enum MethodTypes {
  POST = 'post',
  PUT = 'put',
}

export { EntryPoints, EntryPointsWithId, MethodTypes };
