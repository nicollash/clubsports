/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import {
  loadLibraryManagerData,
  saveSharedItem,
  saveClonedItem,
  deleteLibraryItem,
} from './logic/actions';
import { IAppState } from 'reducers/root-reducer.types';
import Navigation from './components/navigation';
import PopupShare from './components/popup-share';
import PopupClone from './components/popup-clone';
import Events from './components/events';
import Registration from './components/registration';
import Facilities from './components/facilities';
import Divisions from './components/divisions';
import Scheduling from './components/scheduling';
import {
  HeadingLevelTwo,
  Loader,
  Button,
  DeletePopupConfrim,
} from 'components/common';
import {
  BindingAction,
  IEventDetails,
  BindingCbWithThree,
  BindingCbWithTwo,
} from 'common/models';
import {
  MenuTitles,
  EntryPoints,
  ButtonVariant,
  ButtonColors,
} from 'common/enums';
import { IEntity } from 'common/types';
import {
  ILibraryManagerRegistration,
  ILibraryManagerFacility,
  ILibraryManagerDivision,
  ILibraryManagerSchedule,
  ITableSortEntity,
} from './common';
import styles from './styles.module.scss';

const DELETE_POPUP_MESSAGE =
  'To confirm that you want to delete this item from your library, please confirm by re-typing its name.';

interface Props {
  isLoading: boolean;
  isLoaded: boolean;
  events: IEventDetails[];
  registrations: ILibraryManagerRegistration[];
  facilities: ILibraryManagerFacility[];
  divisions: ILibraryManagerDivision[];
  schedules: ILibraryManagerSchedule[];
  loadLibraryManagerData: BindingAction;
  saveSharedItem: BindingCbWithThree<IEventDetails, IEntity, EntryPoints>;
  saveClonedItem: BindingCbWithThree<string, IEntity, EntryPoints>;
  deleteLibraryItem: BindingCbWithTwo<IEntity, EntryPoints>;
}

const LibraryManager = ({
  isLoading,
  events,
  registrations,
  facilities,
  divisions,
  schedules,
  loadLibraryManagerData,
  saveSharedItem,
  saveClonedItem,
  deleteLibraryItem,
}: Props) => {
  React.useEffect(() => {
    loadLibraryManagerData();
  }, []);
  const [activeEvent, changeActiveEvent] = React.useState<IEventDetails | null>(
    null
  );

  const [sharedItem, changeSharedItem] = React.useState<IEntity | null>(null);
  const [clonedItem, changeClonedItem] = React.useState<IEntity | null>(null);

  const [
    tableEntity,
    changeTableEntity,
  ] = React.useState<ITableSortEntity | null>(null);

  const [
    currentEntryPoint,
    changeEntryPoint,
  ] = React.useState<EntryPoints | null>(null);

  const [isSectionsExpand, toggleSectionCollapse] = React.useState<boolean>(
    true
  );

  const [isSharePopupOpen, toggleSharePopup] = React.useState<boolean>(false);

  const [isCondfirmPopupOpen, toggleConfirmPopup] = React.useState<boolean>(
    false
  );

  const onChangeActiveEvent = (event: IEventDetails) => {
    changeActiveEvent(event);
  };

  const onSharedItem = (sharedItem: IEntity, entryPoint: EntryPoints) => {
    changeSharedItem(sharedItem);

    changeEntryPoint(entryPoint);

    toggleSharePopup(true);
  };

  const onClonedItem = (clonedItem: IEntity, entryPoint: EntryPoints) => {
    changeClonedItem(clonedItem);

    changeEntryPoint(entryPoint);
  };

  const onConfirmDeleteItem = (
    sharedItem: IEntity,
    tableEntity: ITableSortEntity,
    entryPoint: EntryPoints
  ) => {
    changeSharedItem(sharedItem);

    changeTableEntity(tableEntity);

    changeEntryPoint(entryPoint);

    toggleConfirmPopup(true);
  };

  const onCloseSharePopup = () => {
    changeActiveEvent(null);

    changeSharedItem(null);

    changeEntryPoint(null);

    toggleSharePopup(false);
  };

  const onClosePopupClone = () => {
    changeClonedItem(null);

    changeEntryPoint(null);
  };

  const onCloseConfirmPopup = () => {
    changeSharedItem(null);

    changeTableEntity(null);

    changeEntryPoint(null);

    toggleConfirmPopup(false);
  };

  const onSaveShatedItem = () => {
    if (activeEvent && sharedItem && currentEntryPoint) {
      saveSharedItem(activeEvent, sharedItem, currentEntryPoint);

      onCloseSharePopup();
    }
  };

  const onSaveClonedItem = (newName: string) => {
    if (newName && clonedItem && currentEntryPoint) {
      saveClonedItem(newName, clonedItem, currentEntryPoint);
    }
  };

  const onDeleteLibraryItem = () => {
    if (sharedItem && currentEntryPoint) {
      deleteLibraryItem(sharedItem, currentEntryPoint);

      onCloseConfirmPopup();
    }
  };

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Navigation />
      <div className={styles.headingWrapper}>
        <HeadingLevelTwo>{MenuTitles.LIBRARY_MANAGER}</HeadingLevelTwo>
        <Button
          onClick={onToggleSectionCollapse}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
        />
      </div>
      <ul className={styles.libraryList}>
        <Events
          events={events}
          isSectionExpand={isSectionsExpand}
          onClonedItem={onClonedItem}
          onConfirmDeleteItem={onConfirmDeleteItem}
        />
        <Facilities
          facilities={facilities}
          isSectionExpand={isSectionsExpand}
          changeSharedItem={onSharedItem}
          onConfirmDeleteItem={onConfirmDeleteItem}
        />
        <Registration
          registrations={registrations}
          isSectionExpand={isSectionsExpand}
          changeSharedItem={onSharedItem}
          onConfirmDeleteItem={onConfirmDeleteItem}
        />
        <Divisions
          divisions={divisions}
          isSectionExpand={isSectionsExpand}
          changeSharedItem={onSharedItem}
          onConfirmDeleteItem={onConfirmDeleteItem}
        />
        <Scheduling
          schedules={schedules}
          isSectionExpand={isSectionsExpand}
          changeSharedItem={onSharedItem}
          onConfirmDeleteItem={onConfirmDeleteItem}
        />
      </ul>
      <PopupShare
        activeEvent={activeEvent}
        events={events}
        isOpen={isSharePopupOpen}
        onClose={onCloseSharePopup}
        onSave={onSaveShatedItem}
        onChangeActiveEvent={onChangeActiveEvent}
      />
      <PopupClone
        isOpen={Boolean(clonedItem)}
        onClose={onClosePopupClone}
        onSave={onSaveClonedItem}
      />
      <DeletePopupConfrim
        type="item"
        deleteTitle={tableEntity?.name || ''}
        message={DELETE_POPUP_MESSAGE}
        isOpen={isCondfirmPopupOpen}
        onClose={onCloseConfirmPopup}
        onDeleteClick={onDeleteLibraryItem}
      />
    </>
  );
};

export default connect(
  ({ libraryManager }: IAppState) => ({
    isLoading: libraryManager.isLoading,
    isLoaded: libraryManager.isLoaded,
    events: libraryManager.events,
    registrations: libraryManager.registrations,
    facilities: libraryManager.facilities,
    divisions: libraryManager.divisions,
    schedules: libraryManager.schedules,
  }),
  (dispatch: Dispatch) =>
    bindActionCreators(
      {
        loadLibraryManagerData,
        saveSharedItem,
        saveClonedItem,
        deleteLibraryItem,
      },
      dispatch
    )
)(LibraryManager);
