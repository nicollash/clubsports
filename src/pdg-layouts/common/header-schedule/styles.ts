import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    padding: '0 15px',
  },
  headerWrapper: {
    flexGrow: 1,

    marginRight: 50,
  },
  headerWrapperPool: {
    flexGrow: 1,
    width: '100%',

    marginRight: 50,
  },
  eventName: {
    marginBottom: 5,

    fontSize: 16,
    borderBottom: 2,

    borderColor: '#333',
  },
  eventNamePool: {
    textAlign: "center",
    fontSize: 20,
  },
  scheduleName: {
    marginBottom: 5,

    fontSize: 10,

    fontWeight: 600,
  },
  divisionName: {
    fontSize: 18,
    textAlign: "center",
  },
  divisionDate: {
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
  mainContactWrapper: {
    flexDirection: 'row',
  },
  mainContactNameWrapper: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 5,
  },
  mainContactTitle: {
    fontSize: 10,
    marginRight: 3,
  },
  mainContact: {
    marginRight: 5,
  },
  logoWrapperPool: {
    width: 100,
    marginLeft: -150,
  },
  logoWrapper: {
    width: 100,
  },
  logo: {
    objectFit: "contain",
    height: 100,
    marginLeft: 20,
  },
  scoreResult: {
    marginBottom: 5,
  },
});

export { styles };
