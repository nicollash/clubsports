import { ThunkAction } from 'redux-thunk';
import { ActionCreator, Dispatch } from 'redux';
import {
  LibraryManagerAction,
  LIBRARY_MANAGER_LOAD_DATA_START,
  LIBRARY_MANAGER_LOAD_DATA_SUCCESS,
  LIBRARY_MANAGER_LOAD_DATA_FAILURE,
  SAVE_SHARED_ITEM_SUCCESS,
  SAVE_SHARED_ITEM_FAILURE,
  SAVE_CLONED_ITEM_SUCCESS,
  SAVE_CLONED_ITEM_FAILURE,
  DELETE_LIBRARY_ITEM_SUCCESS,
  DELETE_LIBRARY_ITEM_FAILURE,
} from './action-types';
import Api from 'api/api';
import { Toasts } from 'components/common';
import {
  mapArrWithEventName,
  removeObjKeysByEntryPoint,
  sentToServerByRoute,
} from 'helpers';
import {
  IEventDetails,
  IRegistration,
  IFacility,
  IDivision,
  ISchedule,
} from 'common/models';
import { EntryPoints, MethodTypes, LibraryStates } from 'common/enums';
import { IEntity } from 'common/types';
import {
  SetFromLibraryManager,
  getClearScharedItem,
  getClearClonedItem,
  getLibraryallowedItems,
} from '../helpers';
import { checkSharedItem, checkClonedItem } from '../helpers.validation';

const loadLibraryManagerData: ActionCreator<ThunkAction<
  void,
  {},
  null,
  LibraryManagerAction
>> = () => async (dispatch: Dispatch) => {
  try {
    dispatch({
      type: LIBRARY_MANAGER_LOAD_DATA_START,
    });

    const events = await Api.get(EntryPoints.EVENTS);
    const registrations = await Api.get(EntryPoints.REGISTRATIONS);
    const facilities = await Api.get(EntryPoints.FACILITIES);
    const divisions = await Api.get(EntryPoints.DIVISIONS);
    const schedules = await Api.get(EntryPoints.SCHEDULES);

    const allowedRegistrations = getLibraryallowedItems(registrations);
    const allowedFacilities = getLibraryallowedItems(facilities);
    const allowedDivision = getLibraryallowedItems(divisions);
    const allowedSchedules = getLibraryallowedItems(schedules);

    const mappedRegistrationWithEvent = mapArrWithEventName(
      allowedRegistrations,
      events
    );
    const mappedFacilitiesWithEvent = mapArrWithEventName(
      allowedFacilities,
      events
    );
    const mappedDivisionsWithEvent = mapArrWithEventName(
      allowedDivision,
      events
    );
    const mappedShedulesWithEvent = mapArrWithEventName(
      allowedSchedules,
      events
    );

    dispatch({
      type: LIBRARY_MANAGER_LOAD_DATA_SUCCESS,
      payload: {
        events,
        registrations: mappedRegistrationWithEvent,
        facilities: mappedFacilitiesWithEvent,
        divisions: mappedDivisionsWithEvent,
        schedules: mappedShedulesWithEvent,
      },
    });
  } catch {
    dispatch({
      type: LIBRARY_MANAGER_LOAD_DATA_FAILURE,
    });
  }
};

const saveSharedItem: ActionCreator<ThunkAction<
  void,
  {},
  null,
  LibraryManagerAction
>> = (
  event: IEventDetails,
  sharedItem: IEntity,
  entryPoint: EntryPoints
) => async (dispatch: Dispatch) => {
  try {
    await checkSharedItem(sharedItem, event, entryPoint);

    const clearSharedItem = getClearScharedItem(sharedItem, event, entryPoint);

    switch (entryPoint) {
      case EntryPoints.EVENTS: {
        await SetFromLibraryManager.setEventFromLibrary(
          event as IEventDetails,
          clearSharedItem as IEventDetails
        );
        break;
      }
      case EntryPoints.REGISTRATIONS: {
        await SetFromLibraryManager.setRegistrationFromLibrary(
          sharedItem as IRegistration,
          clearSharedItem as IRegistration,
          event
        );
        break;
      }
      case EntryPoints.FACILITIES: {
        await SetFromLibraryManager.setFacilityFromLibrary(
          sharedItem as IFacility,
          clearSharedItem as IFacility
        );
        break;
      }
      case EntryPoints.DIVISIONS: {
        await SetFromLibraryManager.setDivisionFromLibrary(
          sharedItem as IDivision,
          clearSharedItem as IDivision
        );
        break;
      }
      case EntryPoints.SCHEDULES: {
        await SetFromLibraryManager.setScheduleFromLibrary(
          clearSharedItem as ISchedule
        );
        break;
      }
    }

    dispatch({
      type: SAVE_SHARED_ITEM_SUCCESS,
    });

    Toasts.successToast('Changes successfully saved.');
  } catch (err) {
    dispatch({
      type: SAVE_SHARED_ITEM_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const saveClonedItem: ActionCreator<ThunkAction<
  void,
  {},
  null,
  LibraryManagerAction
>> = (newName: string, clonedItem: IEntity, entryPoint: EntryPoints) => async (
  dispatch: Dispatch
) => {
  try {
    const clearClonedItem = getClearClonedItem(clonedItem, newName, entryPoint);

    await checkClonedItem(clearClonedItem, entryPoint);

    await sentToServerByRoute(clearClonedItem, entryPoint, MethodTypes.POST);

    dispatch({
      type: SAVE_CLONED_ITEM_SUCCESS,
      payload: {
        entity: clearClonedItem,
        entryPoint,
      },
    });

    Toasts.successToast('Changes successfully saved.');
  } catch (err) {
    dispatch({
      type: SAVE_CLONED_ITEM_FAILURE,
    });

    Toasts.errorToast(err.message);
  }
};

const deleteLibraryItem: ActionCreator<ThunkAction<
  void,
  {},
  null,
  LibraryManagerAction
>> = (sharedItem: IEntity, entryPoint: EntryPoints) => async (
  dispatch: Dispatch
) => {
  const clearSharedItem = removeObjKeysByEntryPoint(sharedItem, entryPoint);

  const updatedSharedItem: IEntity = {
    ...clearSharedItem,
    is_library_YN: LibraryStates.FALSE,
  };

  try {
    await sentToServerByRoute(updatedSharedItem, entryPoint, MethodTypes.PUT);

    dispatch({
      type: DELETE_LIBRARY_ITEM_SUCCESS,
      payload: {
        libraryItem: sharedItem,
        entryPoint,
      },
    });

    Toasts.successToast('Changes successfully saved.');
  } catch {
    dispatch({
      type: DELETE_LIBRARY_ITEM_FAILURE,
    });
  }
};

export {
  loadLibraryManagerData,
  saveSharedItem,
  saveClonedItem,
  deleteLibraryItem,
};
