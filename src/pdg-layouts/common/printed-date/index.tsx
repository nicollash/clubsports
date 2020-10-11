import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import moment from 'moment';
import { styles } from './styles';

const PrintDate = () => (
  <View style={styles.wrapper} fixed>
    <Text>Printed Date: {moment(new Date()).format('LLL')}</Text>
  </View>
);

export default PrintDate;
