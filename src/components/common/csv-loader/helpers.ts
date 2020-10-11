import { IColumnDetails, IField } from 'common/models/table-columns';
import { getVarcharEight } from 'helpers';
import {
  eventDetailsSchema,
  divisionSchema,
  facilitySchema,
  teamSchema,
  playerSchema,
} from 'validations';

export const parseTableDetails = (tableDetails: string): IColumnDetails[] => {
  return JSON.parse(`[${tableDetails}]`).flat();
};

export const getPreview = (
  data: string[][],
  isHeaderIncluded: boolean,
  headerPosition: number
) => {
  if (isHeaderIncluded) {
    return {
      header: data[headerPosition - 1],
      row: data[headerPosition],
    };
  } else {
    return { header: data[0].map((_f: string) => '—'), row: data[0] };
  }
};

export const getColumnOptions = (tableDetails: string) => {
  const parsedTableDetails = parseTableDetails(tableDetails);
  return parsedTableDetails.map((col: IColumnDetails) => ({
    label: col.column_display,
    value: col.column_name,
  }));
};

export const mapFieldForSaving = (fields: IField[]) => {
  return fields.map(field => {
    if (field.included) {
      return field.map_id;
    } else {
      return '';
    }
  });
};

export const parseMapping = (mapping: string, tableDetails: string) => {
  const parsedTableDetails = parseTableDetails(tableDetails);
  const parsedMapping = JSON.parse(mapping);

  const newFields = parsedMapping.map((fieldId: string, index: number) => {
    if (fieldId) {
      const tableField = parsedTableDetails.find(x => x.map_id === fieldId);
      if (!tableField) {
        throw new Error('Corrupted mapping');
      } else {
        return {
          value: tableField.column_name,
          csvPosition: index,
          dataType: tableField.data_type,
          included: true,
          map_id: tableField.map_id,
        };
      }
    } else {
      return {
        value: '',
        csvPosition: index,
        dataType: '',
        included: false,
        map_id: '',
      };
    }
  });

  return newFields;
};

const getBaseObj = (type: string, eventId?: string) => {
  switch (type) {
    case 'facilities':
      return {
        event_id: eventId,
        facilities_id: getVarcharEight(),
        isNew: true,
      };
    case 'event_master':
      return {
        event_id: getVarcharEight(),
      };
    case 'divisions':
      return {
        division_id: getVarcharEight(),
        event_id: eventId,
      };
    case 'teams':
      return {
        team_id: getVarcharEight(),
        event_id: eventId,
      };
    case 'divisions_pools_teams':
      return {
        team_id: getVarcharEight(),
        event_id: eventId,
      };
    default:
      return {
        event_id: getVarcharEight(),
      };
  }
};

export const mapDataForSaving = (
  type: string,
  data: string[],
  fields: IField[],
  eventId?: string
) => {
  const baseObj = getBaseObj(type, eventId);

  return fields.reduce((obj, item) => {
    if (data[item.csvPosition] && item.included) {
      Object.assign(obj, {
        [item.value]: data[item.csvPosition],
      });
    }
    return obj;
  }, baseObj);
};

export const checkCsvForValidity = (
  data: string[],
  headerIncluded: boolean,
  headerPosition: number,
  fields: IField[]
) => {
  if (headerIncluded && data.length <= headerPosition) {
    return false;
  }
  if (headerIncluded && data[headerPosition - 1].length > fields.length) {
    return true;
  }
  // if (!headerIncluded && data[0].length > fields.length) {
  //   return false;
  // }
  return true;
};

export const getRequiredFields = (type: string, tableDetails: string) => {
  let requiredFromValidation: any = [];
  if (type === 'event_master') {
    requiredFromValidation = Object.keys(eventDetailsSchema.fields);
  } else if (type === 'divisions') {
    requiredFromValidation = Object.keys(divisionSchema.fields);
  } else if (type === 'facilities') {
    requiredFromValidation = Object.keys(facilitySchema.fields);
  } else if (type === 'teams') {
    requiredFromValidation = Object.keys(teamSchema.fields);
  } else if (type === 'players') {
    requiredFromValidation = Object.keys(playerSchema.fields);
  }
  const parsedTableDetails = parseTableDetails(tableDetails);

  const requiredColumns = parsedTableDetails
    .filter(
      column =>
        requiredFromValidation.includes(column.column_name) ||
        column.is_nullable === 'NO'
    )
    .map(column => column.column_display);
  return requiredColumns;
};
