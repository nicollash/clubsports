import React from 'react';
import TableSort from '../table-sort';
import { SectionDropdown } from 'components/common';
import { MenuTitles, EntryPoints } from 'common/enums';
import { BindingCbWithTwo, BindingCbWithThree } from 'common/models';
import { IEntity } from 'common/types';
import { ILibraryManagerRegistration, ITableSortEntity } from '../../common';

interface Props {
  registrations: ILibraryManagerRegistration[];
  isSectionExpand: boolean;
  changeSharedItem: BindingCbWithTwo<IEntity, EntryPoints>;
  onConfirmDeleteItem: BindingCbWithThree<
    IEntity,
    ITableSortEntity,
    EntryPoints
  >;
}

const Registration = ({
  registrations,
  isSectionExpand,
  changeSharedItem,
  onConfirmDeleteItem,
}: Props) => {
  const onShareRegistr = (id: string) => {
    const editedRegistration = registrations.find(
      it => it.registration_id === id
    );

    changeSharedItem(editedRegistration!, EntryPoints.REGISTRATIONS);
  };

  const onConfirmDelete = (tableEntity: ITableSortEntity) => {
    const currentRegistration = registrations.find(
      it => it.registration_id === tableEntity.id
    );

    onConfirmDeleteItem(
      currentRegistration!,
      tableEntity,
      EntryPoints.REGISTRATIONS
    );
  };

  const rowForTable = registrations.map(it => ({
    id: it.registration_id,
    event: it.eventName,
    name: `Registration(${it.eventName})`,
    lastModified: it.updated_datetime || it.created_datetime,
  }));

  return (
    <li>
      <SectionDropdown
        id={MenuTitles.REGISTRATION}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <span>{MenuTitles.REGISTRATION}</span>
        <TableSort
          rows={rowForTable}
          onShare={onShareRegistr}
          onDelete={onConfirmDelete}
        />
      </SectionDropdown>
    </li>
  );
};

export default Registration;
