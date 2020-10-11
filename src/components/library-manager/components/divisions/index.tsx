import React from 'react';
import TableSort from '../table-sort';
import { SectionDropdown } from 'components/common';
import { MenuTitles, EntryPoints } from 'common/enums';
import { BindingCbWithTwo, BindingCbWithThree } from 'common/models';
import { IEntity } from 'common/types';
import { ILibraryManagerDivision, ITableSortEntity } from '../../common';

interface Props {
  divisions: ILibraryManagerDivision[];
  isSectionExpand: boolean;
  changeSharedItem: BindingCbWithTwo<IEntity, EntryPoints>;
  onConfirmDeleteItem: BindingCbWithThree<
    IEntity,
    ITableSortEntity,
    EntryPoints
  >;
}

const Divisions = ({
  divisions,
  isSectionExpand,
  changeSharedItem,
  onConfirmDeleteItem,
}: Props) => {
  const onShareDivision = (id: string) => {
    const editedDivision = divisions.find(it => it.division_id === id);

    changeSharedItem(editedDivision!, EntryPoints.DIVISIONS);
  };

  const onConfirmDelete = (tableEntity: ITableSortEntity) => {
    const currentDivision = divisions.find(
      it => it.division_id === tableEntity.id
    );

    onConfirmDeleteItem(currentDivision!, tableEntity, EntryPoints.DIVISIONS);
  };

  const rowForTable = divisions.map(it => ({
    id: it.division_id,
    event: it.eventName,
    name: it.long_name,
    lastModified: it.updated_datetime || it.created_datetime,
  }));

  return (
    <li>
      <SectionDropdown
        id={MenuTitles.DIVISIONS_AND_POOLS}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <span>{MenuTitles.DIVISIONS_AND_POOLS}</span>
        <TableSort
          rows={rowForTable}
          onShare={onShareDivision}
          onDelete={onConfirmDelete}
        />
      </SectionDropdown>
    </li>
  );
};

export default Divisions;
