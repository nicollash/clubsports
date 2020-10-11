import Api from 'api/api';
import {
  getVarcharEight,
  removeObjKeysByEntryPoint,
  generateEntityId,
  setLibraryState,
} from 'helpers';
import {
  EntryPoints,
  IEventDetailsFields,
  LibraryStates,
  EventStatuses,
  ScheduleStatuses,
} from 'common/enums';
import { IEntity } from 'common/types';
import {
  IRegistration,
  IEventDetails,
  IFacility,
  IField,
  IDivision,
  IPool,
  ISchedule,
} from 'common/models';
import { IPoolWithTeams } from './common';

const getLibraryallowedItems = (items: IEntity[]) => {
  const allowedItems = items.filter(it => Boolean(it.is_library_YN));

  return allowedItems;
};

const getClonedItemWithName = (
  clonedItem: IEntity,
  newName: string,
  entryPoint: EntryPoints
) => {
  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      return { ...clonedItem, [IEventDetailsFields.EVENT_NAME]: newName };
    }
  }
};

const getClearScharedItem = (
  sharedItem: IEntity,
  event: IEventDetails,
  entryPoint: EntryPoints
) => {
  const mappedSharedItem = {
    ...sharedItem,
    event_id: event.event_id,
    is_library_YN: LibraryStates.FALSE,
  } as IEntity;

  const sharedItemWithNewId = generateEntityId(mappedSharedItem, entryPoint);

  const clearSharedItem = removeObjKeysByEntryPoint(
    sharedItemWithNewId,
    entryPoint
  );

  return clearSharedItem;
};

const getClearClonedItem = (
  clonedItem: IEntity,
  newName: string,
  entryPoint: EntryPoints
) => {
  const clonedItemWithName = getClonedItemWithName(
    clonedItem,
    newName,
    entryPoint
  ) as IEntity;

  const clearLibraryClonedItem = setLibraryState(
    clonedItemWithName,
    LibraryStates.FALSE
  );

  const clonedItemWithNewId = generateEntityId(
    clearLibraryClonedItem,
    entryPoint
  );

  const clearClonedItem = removeObjKeysByEntryPoint(
    clonedItemWithNewId,
    entryPoint
  );

  switch (entryPoint) {
    case EntryPoints.EVENTS: {
      const event = clearClonedItem as IEventDetails;
      const updatedEvent = {
        ...event,
        is_published_YN: EventStatuses.Draft,
      };

      return updatedEvent;
    }
  }

  return clearClonedItem;
};

const setEventFromLibrary = async (
  event: IEventDetails,
  newEvent: IEventDetails
) => {
  const updatedEvent = { ...newEvent, event_id: event.event_id };

  await Api.put(
    `${EntryPoints.EVENTS}?event_id=${event.event_id}`,
    updatedEvent
  );
};

const setRegistrationFromLibrary = async (
  registration: IRegistration,
  newRegistration: IRegistration,
  event: IEventDetails
) => {
  const ownedRegistrations = await Api.get(
    `/registrations?event_id=${event.event_id}`
  );
  const currentRegistration = ownedRegistrations.find(
    (it: IRegistration) => it.event_id === event.event_id
  );

  if (
    currentRegistration &&
    currentRegistration.registration_id !== registration.registration_id
  ) {
    await Api.delete(
      `/registrations?registration_id=${currentRegistration.registration_id}`
    );
  }

  await Api.post(EntryPoints.REGISTRATIONS, newRegistration);
};

const setFacilityFromLibrary = async (
  facility: IFacility,
  newFacility: IFacility
) => {
  const facilityFieds = await Api.get(
    `/fields?facilities_id=${facility.facilities_id}`
  );

  const mappedFieldsWithNewId = facilityFieds.map((it: IField) => ({
    ...it,
    field_id: getVarcharEight(),
    facilities_id: newFacility.facilities_id,
  }));

  await Api.post(EntryPoints.FACILITIES, newFacility);

  await Promise.all(
    mappedFieldsWithNewId.map((it: IField) => Api.post('/fields', it))
  );
};

const setDivisionFromLibrary = async (
  division: IDivision,
  newDivision: IDivision
) => {
  const divisionPools = await Api.get(
    `/pools?division_id=${division.division_id}`
  );

  const poolWithTeams = (await Promise.all(
    divisionPools.map(async (pool: IPool) => {
      const teams = await Api.get(`/teams?pool_id=${pool.pool_id}`);

      return {
        ...pool,
        teams,
      };
    })
  )) as IPoolWithTeams[];

  const mappedPoolsWithNewId = poolWithTeams.map((pool: IPoolWithTeams) => {
    const newPoolId = getVarcharEight();

    return {
      ...pool,
      pool_id: newPoolId,
      division_id: newDivision.division_id,
      teams: pool.teams.map(team => ({
        ...team,
        team_id: getVarcharEight(),
        pool_id: newPoolId,
        division_id: newDivision.division_id,
        event_id: newDivision.event_id,
      })),
    };
  });

  await Api.post(EntryPoints.DIVISIONS, newDivision);

  for await (let pool of mappedPoolsWithNewId) {
    await Promise.all(
      pool.teams.map(team => Api.post(EntryPoints.TEAMS, team))
    );

    delete pool.teams;

    await Api.post(EntryPoints.POOLS, pool);
  }
};

const setScheduleFromLibrary = async (newSchedule: ISchedule) => {
  const undetedScheduls: ISchedule = {
    ...newSchedule,
    is_published_YN: ScheduleStatuses.Draft,
  };

  await Api.post(EntryPoints.SCHEDULES, undetedScheduls);
};

const SetFromLibraryManager = {
  setEventFromLibrary,
  setFacilityFromLibrary,
  setRegistrationFromLibrary,
  setDivisionFromLibrary,
  setScheduleFromLibrary,
};

export {
  getClearScharedItem,
  SetFromLibraryManager,
  getLibraryallowedItems,
  getClearClonedItem,
};
