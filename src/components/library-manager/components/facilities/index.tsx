import React from 'react';
import TableSort from '../table-sort';
import { SectionDropdown } from 'components/common';
import { MenuTitles, EntryPoints } from 'common/enums';
import { BindingCbWithTwo, BindingCbWithThree } from 'common/models';
import { IEntity } from 'common/types';
import { ILibraryManagerFacility, ITableSortEntity } from '../../common';

interface Props {
  facilities: ILibraryManagerFacility[];
  isSectionExpand: boolean;
  changeSharedItem: BindingCbWithTwo<IEntity, EntryPoints>;
  onConfirmDeleteItem: BindingCbWithThree<
    IEntity,
    ITableSortEntity,
    EntryPoints
  >;
}

const Facilities = ({
  facilities,
  isSectionExpand,
  changeSharedItem,
  onConfirmDeleteItem,
}: Props) => {
  const onShareFacility = (id: string) => {
    const editedFacility = facilities.find(it => it.facilities_id === id);

    changeSharedItem(editedFacility!, EntryPoints.FACILITIES);
  };

  const onConfirmDelete = (tableEntity: ITableSortEntity) => {
    const currentFacility = facilities.find(
      it => it.facilities_id === tableEntity.id
    );

    onConfirmDeleteItem(currentFacility!, tableEntity, EntryPoints.FACILITIES);
  };

  const rowForTable = facilities.map(it => ({
    id: it.facilities_id,
    event: it.eventName,
    name: it.facilities_description,
    lastModified: it.updated_datetime || (it.created_datetime as string),
  }));

  return (
    <li>
      <SectionDropdown
        id={MenuTitles.FACILITIES}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <span>{MenuTitles.FACILITIES}</span>
        <TableSort
          rows={rowForTable}
          onShare={onShareFacility}
          onDelete={onConfirmDelete}
        />
      </SectionDropdown>
    </li>
  );
};

export default Facilities;
