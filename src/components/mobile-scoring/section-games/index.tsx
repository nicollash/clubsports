import React, { useState, useEffect } from "react";
import Api from "api/api";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { makeStyles, Theme } from "@material-ui/core/styles";
import {
  mapScheduleGamesWithNames,
  formatTimeSlot,
  dateToShortString,
} from "helpers";
import {
  IEventDetails,
  ISchedule,
  IFacility,
  IField,
  ISchedulesGame,
  ITeam,
  IFetchedBracket,
} from "common/models";
import { IInputEvent } from "common/types";
import { ScheduleStatuses, BracketStatuses } from "common/enums";
import { Loader, Select, Radio } from "components/common";
import TabGames from "../tab-games";
import {
  getTabTimes,
  getDayOptions,
  getEventDates,
  getTeamWithFacility,
  getGamesByScoreMode,
  mapScoringBracketsWithNames,
  getNewBracketGames,
} from "../helpers";
import { IMobileScoringGame, ScoresRaioOptions } from "../common";
import { IPlayoffGame } from "common/models/playoffs/bracket-game";
import styles from "./styles.module.scss";

const DEFAULT_TAB = 0;

interface Props {
  event: IEventDetails;
}

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const SectionGames = ({ event }: Props) => {
  const classes = useStyles();
  const [isLoading, changeLoading] = useState<boolean>(false);
  const [isLoaded, changeLoaded] = useState<boolean>(false);
  const [activeDay, changeActiveDay] = useState<string | null>(null);
  const [activeTab, changeActiveTab] = useState<number>(DEFAULT_TAB);
  const [scoreMode, changeScoreMode] = useState<ScoresRaioOptions>(
    ScoresRaioOptions.ALL
  );
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [facilities, setFacilities] = useState<IFacility[]>([]);
  const [fields, setFields] = useState<IField[]>([]);
  const [
    publishedBracket,
    setPublishedBracket,
  ] = useState<IFetchedBracket | null>(null);
  const [originGames, setOriginGames] = useState<ISchedulesGame[]>([]);
  const [originBracktGames, setOriginBracktGames] = useState<IPlayoffGame[]>(
    []
  );
  const [gamesWithNames, setGamesWithTames] = useState<IMobileScoringGame[]>(
    []
  );
  const [scheduleGamesWithNames, setScheduleGamesWithNames] = useState<
    IMobileScoringGame[]
  >([]);

  useEffect(() => {
    (async () => {
      changeActiveDay(null);
      changeActiveTab(0);
      setPublishedBracket(null);
      setTeams([]);
      setFacilities([]);
      setFields([]);
      setOriginGames([]);
      setOriginBracktGames([]);
      setGamesWithTames([]);
      setScheduleGamesWithNames([]);
      changeLoading(true);
      changeLoaded(false);
      changeScoreMode(ScoresRaioOptions.ALL);

      const schedules = (await Api.get(
        `/schedules?event_id=${event.event_id}`
      )) as ISchedule[];
      const brackets = (await Api.get(
        `brackets?event_id=${event.event_id}`
      )) as IFetchedBracket[];
      const teams = (await Api.get(
        `/teams?event_id=${event.event_id}`
      )) as ITeam[];
      const facilities = (await Api.get(
        `/facilities?event_id=${event.event_id}`
      )) as IFacility[];
      const fields = (
        await Promise.all(
          facilities.map((facility) =>
            Api.get(`/fields?facilities_id=${facility.facilities_id}`)
          )
        )
      ).flat() as IField[];

      const publishedSchedule = schedules.find(
        (it) => it.is_published_YN === ScheduleStatuses.Published
      );
      const publishedBracket = brackets.find(
        (it) => it.is_published_YN === BracketStatuses.Published
      );

      const games = publishedSchedule
        ? ((await Api.get(
            `/games?schedule_id=${publishedSchedule.schedule_id}`
          )) as ISchedulesGame[])
        : [];
      const bracketGames = publishedBracket
        ? ((await Api.get(
            `/brackets_details?bracket_id=${publishedBracket.bracket_id}`
          )) as IPlayoffGame[])
        : [];

      const gamesWithTeams = games.filter(
        (it) => it.away_team_id || it.away_team_id
      );

      const gamesWithNames = mapScheduleGamesWithNames(
        teams,
        fields,
        gamesWithTeams
      );

      const gameWithFacility = getTeamWithFacility(
        gamesWithNames,
        facilities,
        fields
      );

      const mappedBracketGames = mapScoringBracketsWithNames(
        teams,
        facilities,
        fields,
        bracketGames
      );

      const allGames = [...gameWithFacility, ...mappedBracketGames];

      setTeams(teams);
      setFacilities(facilities);
      setFields(fields);
      setGamesWithTames(allGames);
      setScheduleGamesWithNames(gameWithFacility);
      setOriginGames(games);
      setOriginBracktGames(bracketGames);
      setPublishedBracket(publishedBracket || null);

      changeLoading(false);
      changeLoaded(true);
    })();
  }, [event]);

  const saveBracketGames = async (bracketGames: IPlayoffGame[]) => {
    await Api.put(`/brackets_details`, bracketGames);
  };

  const changeGameWithName = async (changedGame: IMobileScoringGame) => {
    if (changedGame.isPlayoff) {
      const changedOriginBracketGame = originBracktGames.find(
        (game) => game.game_id === changedGame.id
      ) as IPlayoffGame;

      const originBracketGameWithScore: IPlayoffGame = {
        ...changedOriginBracketGame,
        away_team_score:
          changedGame.awayTeamScore === null
            ? null
            : Number(changedGame.awayTeamScore),
        home_team_score:
          changedGame.homeTeamScore === null
            ? null
            : Number(changedGame.homeTeamScore),
      };

      const newOriginBracketGames = await getNewBracketGames(
        originBracketGameWithScore,
        originBracktGames,
        fields,
        publishedBracket as IFetchedBracket
      );

      const newBracketGamesWithNames = mapScoringBracketsWithNames(
        teams,
        facilities,
        fields,
        newOriginBracketGames
      );

      const allGames = [...scheduleGamesWithNames, ...newBracketGamesWithNames];

      await saveBracketGames(newOriginBracketGames);

      setOriginBracktGames(newOriginBracketGames);
      setGamesWithTames(allGames);
    } else {
      const changedGamesWithGames = gamesWithNames.map((game) =>
        game.id === changedGame.id ? changedGame : game
      );

      const changedOriginGames = originGames.map((game) =>
        game.game_id === changedGame.id
          ? {
              ...game,
              away_team_score: changedGame.awayTeamScore,
              home_team_score: changedGame.homeTeamScore,
            }
          : game
      );

      setOriginGames(changedOriginGames);

      setGamesWithTames(changedGamesWithGames);
    }
  };

  const onChangeActiveTimeSlot = (
    _evt: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    changeActiveTab(newValue);
  };

  const onChangeActiveDay = (evt: IInputEvent) => {
    changeActiveDay(evt.target.value);
    changeActiveTab(DEFAULT_TAB);
  };

  const onChangeScoreMode = (evt: IInputEvent) => {
    changeScoreMode(evt.target.value as ScoresRaioOptions);
  };

  if (isLoading || !isLoaded) {
    return <Loader />;
  }

  const eventDays = getEventDates(gamesWithNames);
  const eventDayOptions = getDayOptions(eventDays);
  const tabTimes = getTabTimes(activeDay, gamesWithNames);

  const activeTime = tabTimes.find((_, idx) => idx === activeTab);
  const originGamesByTime = originGames.filter(
    (it: ISchedulesGame) =>
      dateToShortString(it.game_date) === dateToShortString(activeDay) &&
      it.game_time === activeTime
  );
  const gamesWithNamesByTime = gamesWithNames.filter(
    (it: IMobileScoringGame) =>
      dateToShortString(it.gameDate) === dateToShortString(activeDay) &&
      it.startTime === activeTime
  );

  const gameByScoreMode = getGamesByScoreMode(gamesWithNamesByTime, scoreMode);

  return (
    <section>
      <div className={styles.dayWrapper}>
        <h2 className={styles.dayTitle}>Date:</h2>
        <Select
          onChange={onChangeActiveDay}
          value={activeDay || ""}
          options={eventDayOptions}
          width="100%"
          isFullWith={true}
        />
      </div>
      <div className={styles.radionWrapper}>
        <Radio
          row={true}
          checked={scoreMode}
          onChange={onChangeScoreMode}
          options={Object.values(ScoresRaioOptions)}
        />
      </div>
      {activeDay && (
        <div className={styles.tabsWrapper}>
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={onChangeActiveTimeSlot}
            className={classes.tabs}
          >
            {tabTimes.map((it, idx) => (
              <Tab label={formatTimeSlot(it)} key={idx} />
            ))}
          </Tabs>
          <TabGames
            gamesWithName={gameByScoreMode}
            originGames={originGamesByTime}
            originBracktGames={originBracktGames}
            changeGameWithName={changeGameWithName}
          />
        </div>
      )}
    </section>
  );
};

export default SectionGames;
