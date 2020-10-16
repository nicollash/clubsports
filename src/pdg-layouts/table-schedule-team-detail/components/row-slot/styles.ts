import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  gameSlotRow: {
    // borderBottom: 1,
    // borderColor: '#B8B6B0',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0 15',
    padding: '0 0',
  },
  divisionSlot: {
    marginRight: 10,
    fontSize: 10,
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 3,
    backgroundColor: '#DCDCFF',
    textIndent: 5,
    width: '100%',
  },
  teamSlot: {
    marginRight: 3,
    fontSize: 10,
    textIndent: 5,
    width: 80,
  },
  teamCountSlot: {
    flexDirection: 'row',
    marginRight: 3,   
    alignItems: 'center',
    height:25,
    width: 96
  },
  teamCountCell: {
    marginRight: 2,
    fontSize: 10,
    textAlign: 'center',
    width: 30
  },
  teamGame: {
    marginRight: 3,
    fontSize: 8,
    alignItems: 'center',
    width: 80,
    height: 12,
  },
  teamGameInfo: {
    marginRight: 10,
    fontSize: 7,
    alignItems: 'center',
    width: 80,
    height:8,
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
