import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { IScheduleFacility } from 'common/models/schedule/facilities';
import { IField } from 'common/models/schedule/fields';
import { DEFAUL_COLUMNS_COUNT } from '../../common';
import { styles } from './styles';

interface Props {
  facility: IScheduleFacility;
  fields: IField[];
  splitIdx: number;
}

const TableThead = ({ facility, fields, splitIdx }: Props) => (
  <View style={styles.thead}>
    {fields
      .map(field => (
        <Text key={field.id} style={styles.fieldName}>
          {`${field.name} ${facility.abbr}`}
        </Text>
      ))
      .slice(splitIdx, splitIdx + DEFAUL_COLUMNS_COUNT)}
  </View>
);

export default TableThead;
