import React from 'react';
import TableSort from '../table-sort';
import { SectionDropdown } from 'components/common';
import { MenuTitles, EntryPoints } from 'common/enums';
import {
  BindingCbWithTwo,
  BindingCbWithThree,
  IEventDetails,
} from 'common/models';
import { IEntity } from 'common/types';
import { ITableSortEntity } from '../../common';
import { getLibraryallowedItems } from 'components/library-manager/helpers';

interface Props {
  events: IEventDetails[];
  isSectionExpand: boolean;
  onClonedItem: BindingCbWithTwo<IEntity, EntryPoints>;
  onConfirmDeleteItem: BindingCbWithThree<
    IEntity,
    ITableSortEntity,
    EntryPoints
  >;
}

const Events = ({
  events,
  isSectionExpand,
  onClonedItem,
  onConfirmDeleteItem,
}: Props) => {
  const onCloneEvent = (id: string) => {
    const editedTournament = events.find(it => it.event_id === id);

    onClonedItem(editedTournament!, EntryPoints.EVENTS);
  };

  const onConfirmDelete = (tableEntity: ITableSortEntity) => {
    const currentTournament = events.find(it => it.event_id === tableEntity.id);

    onConfirmDeleteItem(currentTournament!, tableEntity, EntryPoints.EVENTS);
  };

  const allowedEvents = getLibraryallowedItems(events) as IEventDetails[];

  const rowForTable = allowedEvents.map(it => ({
    id: it.event_id,
    event: it.event_name,
    name: `Event (${it.event_name})`,
    lastModified: it.updated_datetime || (it.created_datetime as string),
  }));

  return (
    <li>
      <SectionDropdown
        id={MenuTitles.EVENTS}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <span>{MenuTitles.EVENTS}</span>
        <TableSort
          rows={rowForTable}
          onDelete={onConfirmDelete}
          onClone={onCloneEvent}
        />
      </SectionDropdown>
    </li>
  );
};

export default Events;
