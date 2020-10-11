// Process incoming SMS messages
import { Context, SNSEvent } from 'aws-lambda';
import { authUser } from './app/privateApi/auth';
import axios from 'axios';

import './services/logger';

const MIN_SCORE = 0;
const MAX_SCORE = 30;

const isValidScore = (scoreStr: string | null | undefined) => {
  let score: number | null = null;

  try {
    if (scoreStr === null || scoreStr === undefined || scoreStr === '') {
      throw new Error();
    }

    if (typeof scoreStr === 'string') {
      score = Number(scoreStr);
    } else if (typeof scoreStr === 'number') {
      score = scoreStr;
    } else {
      throw new Error();
    }

    if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
      throw new Error();
    }
  } catch (err) {
    throw new Error(
      `That result seems off: ${scoreStr}. Goals should be between ${MIN_SCORE} and ${MAX_SCORE}`
    );
  }

  return true;
};

export const handler = async (event: SNSEvent, context?: Context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.init(context!);

  let responseMsg = 'Unable to post scores. Please contact event organizer';
  let token = '';
  let message;

  try {
    message = JSON.parse(event.Records[0].Sns.Message);
    console.log(`Incoming Message: ${JSON.stringify(message)}`);
    token = await authUser();
    if (!message || !token) {
      throw new Error('Empty message or token. Check configuration');
    }
  } catch (err) {
    console.logError(err);
    return;
  }

  try {
    const [gameId, awayTeamScore, homeTeamScore] = message.messageBody
      .toUpperCase()
      .split(',')
      .map((x: string) => x.trim()); // Roman, shouldn't we have a TRIM in here too?? What if they have spaces??

    if (!gameId || !awayTeamScore || !homeTeamScore) {
      throw new Error('Sorry, the format is off. Format: <game ID>,<away team score>,<home team score>');
    }

    if (!isValidScore(awayTeamScore) || !isValidScore(homeTeamScore)) {
      throw new Error('Sorry, the format is off. Format: <game ID>,<away team score>,<home team score>');
    }

    const game = (
      await axios.get(
        process.env.PRIVATE_API_BASE_URL! +
          `/schedules_details?game_id=${gameId}`,
        { headers: { Authorization: `${token}` } }
      )
    ).data[0];

    if (!game) {
      throw new Error(`Game ${gameId} not found. Please try again.`);
    }

    const awayTeam = (
      await axios.get(
        process.env.PRIVATE_API_BASE_URL! +
          `/teams?team_id=${game.away_team_id}`,
        { headers: { Authorization: `${token}` } }
      )
    ).data[0];

    if (!awayTeam) {
      throw new Error(
        `Game ${gameId} is not properly set up. Please submit your results directly to the organizer.`
      );
    }

    const homeTeam = (
      await axios.get(
        process.env.PRIVATE_API_BASE_URL! +
          `/teams?team_id=${game.home_team_id}`,
        { headers: { Authorization: `${token}` } }
      )
    ).data[0];

    if (!homeTeam) {
      throw new Error(
        `Game ${gameId} is not properly set up. Please submit your results directly to the organizer.`
      );
    }

    console.log(`Updating game: ${JSON.stringify(game)}`);

    const res = await axios.put(
      process.env.PRIVATE_API_BASE_URL! +
        `/schedules_details?game_id=${gameId}`,
      { away_team_score: awayTeamScore, home_team_score: homeTeamScore },
      {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!(res.data?.affectedRows === 1)) {
      throw new Error(
        `Game ${gameId} score did not update. Please contact the event organizer.`
      );
    }

    responseMsg = `Nice work, score confirmed: ${
      awayTeam.long_name
    } scored ${awayTeamScore} & ${
      homeTeam.long_name
    } scored ${homeTeamScore} for the ${game.game_time.slice(0, 5)} timeslot on ${game.game_date.slice(
      0,
      10
    )}. Thanks!`;
    console.log(responseMsg);
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    responseMsg = err.message;
  }

  try {
    const res = await axios.post(
      process.env.PRIVATE_API_BASE_URL! + `/messages`,
      {
        type: 'Text',
        message: responseMsg,
        recipients: [message.originationNumber],
      },
      {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.logError(err);
    throw err;
  }
};
