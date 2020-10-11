import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
  },
  tableContainer: {
    flexGrow: 1,
    marginBottom: 15,
  },
  facilityWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 5,
  },
  scheduleDate: {
    marginRight: 35,
  },
  facilityName: {
    fontSize: 14,
  },
  pageNumber: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
});

export { styles };
