import { StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  thead: {
    flexDirection: 'column',
    margin: '0 0 5px 80px',
  },
  theadWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  theadName: {
    marginBottom: 5,
    padding: 5,

    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'dodgerblue',
  },

  gameDetailsWrapper: {
    flexDirection: 'column',

    width: '280px',
    marginRight: 10,
  },
  gameDetails: {
    marginBottom: 5,
    padding: '3px 3px 3px 110px',

    backgroundColor: '#DCDCDC',
  },
  teamsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  team: {
    width: '135px',
    padding: '3px 3px 3px 40px',

    color: '#ffffff',
    backgroundColor: '#696969',
  },
  scoresWrapper: {
    width: '115px',
    flexDirection: 'column',

    marginRight: 10,
  },
  scores: {
    padding: '3px 3px 3px 30px',
    marginBottom: 5,

    backgroundColor: '#DCDCDC',
  },
  scoresTeamsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoresTeam: {
    width: '55px',
    padding: '3px 3px 3px 15px',

    color: '#ffffff',
    backgroundColor: '#696969',
  },
  initials: {
    width: '70px',
    padding: '3px 3px 3px 20px',

    backgroundColor: '#DCDCDC',
  },
});

export { styles };
