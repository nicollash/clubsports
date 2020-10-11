import {
  ILibraryManagerRegistration,
  ILibraryManagerFacility,
  ILibraryManagerDivision,
  ILibraryManagerSchedule,
} from '../common';
import { IEventDetails } from 'common/models';
import { IEntity } from 'common/types';
import { EntryPoints } from 'common/enums';

const LIBRARY_MANAGER_LOAD_DATA_START = 'LIBRARY_MANAGER_LOAD_DATA_START';
const LIBRARY_MANAGER_LOAD_DATA_SUCCESS = 'LIBRARY_MANAGER_LOAD_DATA_SUCCESS';
const LIBRARY_MANAGER_LOAD_DATA_FAILURE = 'LIBRARY_MANAGER_LOAD_DATA_FAILURE';

const SAVE_SHARED_ITEM_SUCCESS = 'SAVE_SHARED_ITEM_SUCCESS';
const SAVE_SHARED_ITEM_FAILURE = 'SAVE_SHARED_ITEM_FAILURE';

const SAVE_CLONED_ITEM_SUCCESS = 'SAVE_CLONED_ITEM_SUCCESS';
const SAVE_CLONED_ITEM_FAILURE = 'SAVE_CLONED_ITEM_FAILURE';

const DELETE_LIBRARY_ITEM_SUCCESS = 'DELETE_LIBRARY_ITEM_SUCCESS';
const DELETE_LIBRARY_ITEM_FAILURE = 'DELETE_LIBRARY_ITEM_FAILURE';

interface LibraryManagerLoadDataStart {
  type: 'LIBRARY_MANAGER_LOAD_DATA_START';
}

interface LibraryManagerLoadDataSuccess {
  type: 'LIBRARY_MANAGER_LOAD_DATA_SUCCESS';
  payload: {
    events: IEventDetails[];
    registrations: ILibraryManagerRegistration[];
    facilities: ILibraryManagerFacility[];
    divisions: ILibraryManagerDivision[];
    schedules: ILibraryManagerSchedule[];
  };
}

interface SaveSharedItemSuccess {
  type: 'SAVE_SHARED_ITEM_SUCCESS';
}

interface DeleteLibraryItemSuccess {
  type: 'DELETE_LIBRARY_ITEM_SUCCESS';
  payload: {
    libraryItem: IEntity;
    entryPoint: EntryPoints;
  };
}

interface SaveClonedItemSuccess {
  type: 'SAVE_CLONED_ITEM_SUCCESS';
  payload: {
    entity: IEntity;
    entryPoint: EntryPoints;
  };
}

export type LibraryManagerAction =
  | LibraryManagerLoadDataStart
  | LibraryManagerLoadDataSuccess
  | SaveSharedItemSuccess
  | DeleteLibraryItemSuccess
  | SaveClonedItemSuccess;

export {
  LIBRARY_MANAGER_LOAD_DATA_START,
  LIBRARY_MANAGER_LOAD_DATA_SUCCESS,
  LIBRARY_MANAGER_LOAD_DATA_FAILURE,
  SAVE_SHARED_ITEM_SUCCESS,
  SAVE_SHARED_ITEM_FAILURE,
  SAVE_CLONED_ITEM_SUCCESS,
  SAVE_CLONED_ITEM_FAILURE,
  DELETE_LIBRARY_ITEM_SUCCESS,
  DELETE_LIBRARY_ITEM_FAILURE,
};
