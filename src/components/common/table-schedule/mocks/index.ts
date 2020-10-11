const mockedFields = [
  {
    id: '0',
    facilityId: '0',
    name: 'Field 1',
    isPremier: false,
  },
  {
    id: '1',
    facilityId: '2',
    name: 'Field 2',
    isPremier: false,
  },
];

const mockedTeamCards = [
  {
    id: 'DFLT001',
    name: 'Team # 1',
    startTime: '08:00:00',
    poolId: 'POOL001',
    divisionId: 'DVSN001',
    isPremier: false,
  },
  {
    id: 'DFLT002',
    name: 'Team # 2',
    startTime: '08:00:00',
    poolId: 'POOL001',
    divisionId: 'DVSN001',
    isPremier: false,
  },
  {
    id: 'DFLT003',
    name: 'Team # 3',
    startTime: '08:00:00',
    poolId: 'POOL001',
    divisionId: 'DVSN001',
    isPremier: false,
  },
];

const mockedGames = [
  {
    id: 0,
    startTime: 'startTime0',
    facilityId: 'facilityId0',
    homeTeam: mockedTeamCards[0],
    awayTeam: mockedTeamCards[1],
    timeSlotId: 1,
    fieldId: 'fieldId0',
    isPremier: false,
  },
];

const mockedTimeSlots = [
  {
    id: 0,
    time: '08:00 AM',
  },
  {
    id: 1,
    time: '11:00 AM',
  },
];

export { mockedFields, mockedGames, mockedTeamCards, mockedTimeSlots };
