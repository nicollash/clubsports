export enum TableSortRowTypes {
  ID = 'id',
  EVENT = 'event',
  NAME = 'name',
  LAST_MODIFIED = 'lastModified',
}

export enum OrderTypes {
  ASC = 'asc',
  DESC = 'desc',
}

export interface HeadCell {
  id: TableSortRowTypes;
  label: string;
}
