import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  timeSlotRow: {
    borderBottom: 1,
    borderColor: '#B8B6B0',
    flexDirection: 'row',
    alignItems: 'center',

    margin: '0 10px',
    padding: '0 5px',
  },
  timeSlot: {
    marginRight: 10,

    fontSize: 10,
  },
  gameWrapper: {
    flexDirection: 'column',

    minHeight: 30,

    padding: '5px 1px',
  },
  scoreWrapper: {
    width: 20,
    height: 20,
  },
  score: {
    textAlign: 'center',
    width: 10,
  },
  gameTeamName: {
    width: 94,
    display: 'flex',
    flexDirection: 'row',
    padding: 1,
  },
  teamNameWrapper: {
    fontSize: 8,
    paddingLeft: 1,
    paddingTop: 1,
    maxLines: 1,
  },
  divisionNameWrapper: {
    paddingLeft: 1,
    paddingTop: 1,
    fontSize: 6,
    maxLines: 1,
  },
  wrapper: {
    width: 94,
    marginRight: 1
  },
  nameWrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: 82,
  }
});

export { styles };
