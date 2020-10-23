import React from "react";
import DropContainer, {
  IDropParams,
  MatrixTableDropEnum,
  IExtraGameDropParams,
  GameType,
} from "../dnd/drop";
import TeamDragCard from "../dnd/drag";
import SeedCard from "../dnd/seed";
import CustomSeedCard from "../dnd/custom-seed";
import styles from "../styles.module.scss";
import { IGame } from "../helper";
import { ITeamCard } from "common/models/schedule/teams";
import { TableScheduleTypes } from "common/enums";
import chainIcon from "assets/chainIcon.png";
import { AssignmentType } from "../../table-schedule/helpers";
import { IBracket, IChangedGame, IEventDetails } from "common/models";
import { dateToShortString } from "helpers";
import { checkMultiDay } from "../../../playoffs/helper";

interface Props {
  game: IGame;
  isDndMode: boolean;
  teamCards: ITeamCard[];
  tableType: TableScheduleTypes;
  showHeatmap?: boolean;
  isEnterScores?: boolean;
  assignmentType?: AssignmentType;
  simultaneousDnd?: boolean;
  highlightedGamedId?: number;
  isHighlightSameState?: boolean;
  highlightUnscoredGames?: boolean;
  highlightIncompletedGames?: boolean;
  noTransparentGameId?: string;
  onDrop: (dropParams: IDropParams) => void;
  onGameUpdate: (game: IGame) => void;
  onExtraGameDrop?: (extraGameDropParams: IExtraGameDropParams) => void;
  onTeamCardUpdate: (teamCard: ITeamCard) => void;
  bracket?: IBracket | null;
  onGameScoreUpdate: (game: IChangedGame) => void;
  onDrag: (id: string) => void;
  event?: IEventDetails | null;
}

const RenderGameSlot = (props: Props) => {
  const {
    game,
    teamCards,
    isDndMode,
    tableType,
    showHeatmap,
    onTeamCardUpdate,
    onGameScoreUpdate,
    isEnterScores,
    assignmentType,
    simultaneousDnd,
    highlightedGamedId,
    isHighlightSameState,
    highlightUnscoredGames,
    highlightIncompletedGames,
    noTransparentGameId,
    onDrop,
    onGameUpdate,
    onExtraGameDrop,
    onDrag,
    event,
    bracket,
  } = props;

  const {
    id,
    awayTeam,
    homeTeam,
    gameDate,
    isPlayoff,
    awaySeedId,
    homeSeedId,
    awayTeamId,
    homeTeamId,
    divisionId,
    divisionHex,
    isCancelled,
    divisionName,
    playoffIndex,
    playoffRound,
    awayTeamScore,
    homeTeamScore,
    awayDisplayName,
    homeDisplayName,
    bracketGameId,
    awayDependsUpon,
    homeDependsUpon,
    poolHex,
  } = game;
  const acceptType = [
    MatrixTableDropEnum.TeamDrop,
    MatrixTableDropEnum.ExtraGameDrop,
  ];

  if (isPlayoff) {
    acceptType.push(MatrixTableDropEnum.BracketDrop);
  }

  const findTeamScore = (team: ITeamCard) => {
    return team.games?.find(
      (tc) =>
        tc.fieldId === game.fieldId &&
        tc.startTime === game.startTime &&
        dateToShortString(tc.date) === dateToShortString(gameDate)
    )?.teamScore;
  };

  const checkScore = () => {
    return highlightUnscoredGames && awayTeam && homeTeam
      ? findTeamScore(awayTeam) !== null &&
          findTeamScore(awayTeam) !== "" &&
          findTeamScore(homeTeam) !== null &&
          findTeamScore(homeTeam) !== ""
      : false;
  };

  const checkGame = () => {
    return Boolean(highlightIncompletedGames && awayTeam && homeTeam);
  };

  const checkScoreBrackets = () => {
    if (homeTeam || awayTeam) {
      return false;
    }
    return Boolean(
      highlightUnscoredGames &&
        (homeSeedId || homeDependsUpon) &&
        (awaySeedId || awayDependsUpon) &&
        bracketGameId &&
        awayTeamScore &&
        homeTeamScore
    );
  };

  const opacity =
    noTransparentGameId !== awayTeam?.id &&
    noTransparentGameId !== homeTeam?.id &&
    noTransparentGameId !== ""
      ? 0.2
      : 1;

  const awayTeamName = teamCards.find((item) => item.id === awayTeamId)?.name;
  const homeTeamName = teamCards.find((item) => item.id === homeTeamId)?.name;
  const moveBothChain =
    (!!simultaneousDnd && !!awayTeam && !!homeTeam) ||
    (assignmentType === AssignmentType.Matchups && !!awayTeam && !!homeTeam);
  const highlightSameState =
    awayTeam?.state && homeTeam?.state
      ? awayTeam.state !== homeTeam.state
      : true;
  const isCustomBracket = bracket?.id
    ? bracket?.customPlayoff
    : event?.custom_playoffs_YN;

  return (
    <td
      className={`${styles.gameSlotContainer} ${
        isPlayoff &&
        event &&
        !checkMultiDay(event, bracket) &&
        styles.gameSlotPlayoff
      }`}
    >
      <div
        className={`${styles.gameSlot} ${
          highlightedGamedId === game.id && styles.highlighted
        } ${
          game.gameType === GameType.allstar
            ? styles.allstarGameslot
            : game.gameType === GameType.practice
            ? styles.practiceGameslot
            : ""
        }`}
      >
        <DropContainer
          game={game}
          gameId={game.id}
          position={1}
          teamCards={teamCards}
          acceptType={acceptType}
          onDrop={onDrop}
          onExtraGameDrop={onExtraGameDrop}
          event={event}
          bracket={bracket}
        >
          <div style={{ opacity }}>
            {awayTeam && (
              <TeamDragCard
                game={game}
                type={MatrixTableDropEnum.TeamDrop}
                teamCard={awayTeam}
                isDndMode={isDndMode}
                tableType={tableType}
                showHeatmap={showHeatmap}
                originGameId={game.id}
                originGameDate={gameDate}
                isEnterScores={isEnterScores}
                highlightSameState={highlightSameState && isHighlightSameState}
                highlightUnscoredGames={checkScore()}
                highlightIncompletedGames={checkGame()}
                onTeamCardUpdate={onTeamCardUpdate}
                onGameScoreUpdate={onGameScoreUpdate}
                onDrag={onDrag}
              />
            )}

            {!awayTeam &&
              (!!awaySeedId || !!awayDependsUpon) &&
              !!bracketGameId && !isCustomBracket && (
                <SeedCard
                  type={MatrixTableDropEnum.BracketDrop}
                  round={playoffRound}
                  slotId={id}
                  seedId={awaySeedId}
                  teamId={awayTeamId}
                  teamName={awayTeamName}
                  position={1}
                  teamScore={awayTeamScore}
                  tableType={tableType}
                  isDndMode={isDndMode}
                  divisionId={divisionId!}
                  showHeatmap={true}
                  dependsUpon={awayDependsUpon}
                  divisionHex={poolHex || divisionHex}
                  isCancelled={isCancelled}
                  playoffIndex={playoffIndex!}
                  divisionName={divisionName}
                  bracketGameId={bracketGameId}
                  isEnterScores={isEnterScores}
                  highlightUnscoredGames={checkScoreBrackets()}
                  highlightIncompletedGames={checkGame()}
                  onGameUpdate={(changes: any) =>
                    onGameUpdate({ ...game, ...changes })
                  }
                />
              )}

            {!awayTeam &&
              ((awayDisplayName && awayDisplayName.length > 0) ||
                bracketGameId) &&
              !!isCustomBracket && (
                <CustomSeedCard
                  game={game}
                  type={MatrixTableDropEnum.BracketDrop}
                  displayName={awayDisplayName}
                  slotId={id}
                  teamId={awayTeamId}
                  teamName={awayTeamName}
                  teamCards={teamCards}
                  position={1}
                  teamScore={awayTeamScore}
                  tableType={tableType}
                  isDndMode={isDndMode}
                  divisionId={divisionId!}
                  showHeatmap={true}
                  divisionHex={poolHex || divisionHex}
                  isCancelled={isCancelled}
                  playoffIndex={playoffIndex!}
                  divisionName={divisionName}
                  bracketGameId={bracketGameId!}
                  isEnterScores={isEnterScores}
                  highlightUnscoredGames={checkScoreBrackets()}
                  highlightIncompletedGames={checkGame()}
                  onGameUpdate={(changes: any) =>
                    onGameUpdate({ ...game, ...changes })
                  }
                />
              )}
          </div>
        </DropContainer>
        {moveBothChain && (
          <div
            className={styles.chainWrapper}
            style={{
              opacity,
              backgroundColor: checkGame()
                ? "rgb(227, 225, 220)"
                : poolHex || awayTeam?.divisionHex,
            }}
          >
            <img
              src={chainIcon}
              style={{
                width: "18px",
                height: "18px",
              }}
              alt=""
            />
          </div>
        )}
        <DropContainer
          acceptType={acceptType}
          gameId={game.id}
          game={game}
          position={2}
          onDrop={onDrop}
          onExtraGameDrop={onExtraGameDrop}
          teamCards={teamCards}
          event={event}
          bracket={bracket}
        >
          <div style={{ opacity }}>
            {homeTeam && (
              <TeamDragCard
                game={game}
                type={MatrixTableDropEnum.TeamDrop}
                teamCard={homeTeam}
                isDndMode={isDndMode}
                tableType={tableType}
                showHeatmap={showHeatmap}
                originGameId={game.id}
                isEnterScores={isEnterScores}
                originGameDate={gameDate}
                highlightSameState={highlightSameState && isHighlightSameState}
                highlightUnscoredGames={checkScore()}
                highlightIncompletedGames={checkGame()}
                onTeamCardUpdate={onTeamCardUpdate}
                onGameScoreUpdate={onGameScoreUpdate}
                onDrag={onDrag}
              />
            )}

            {!homeTeam &&
              (!!homeSeedId || !!homeDependsUpon) &&
              !!bracketGameId &&
              !isCustomBracket && (
                <SeedCard
                  type={MatrixTableDropEnum.BracketDrop}
                  round={playoffRound}
                  slotId={id}
                  seedId={homeSeedId}
                  teamId={homeTeamId}
                  teamName={homeTeamName}
                  position={2}
                  teamScore={homeTeamScore}
                  tableType={tableType}
                  isDndMode={isDndMode}
                  divisionId={divisionId!}
                  showHeatmap={true}
                  dependsUpon={homeDependsUpon}
                  divisionHex={poolHex || divisionHex}
                  isCancelled={isCancelled}
                  divisionName={divisionName}
                  bracketGameId={bracketGameId}
                  playoffIndex={playoffIndex!}
                  isEnterScores={isEnterScores}
                  highlightUnscoredGames={checkScoreBrackets()}
                  highlightIncompletedGames={checkGame()}
                  onGameUpdate={(changes: any) =>
                    onGameUpdate({ ...game, ...changes })
                  }
                />
              )}

            {!homeTeam &&
              ((homeDisplayName && homeDisplayName.length > 0) ||
                bracketGameId) &&
              !!isCustomBracket && (
                <CustomSeedCard
                  game={game}
                  type={MatrixTableDropEnum.BracketDrop}
                  displayName={homeDisplayName}
                  slotId={id}
                  teamId={homeTeamId}
                  teamName={homeTeamName}
                  teamCards={teamCards}
                  position={2}
                  teamScore={homeTeamScore}
                  tableType={tableType}
                  isDndMode={isDndMode}
                  divisionId={divisionId!}
                  showHeatmap={true}
                  divisionHex={poolHex || divisionHex}
                  isCancelled={isCancelled}
                  playoffIndex={playoffIndex!}
                  divisionName={divisionName}
                  bracketGameId={bracketGameId!}
                  isEnterScores={isEnterScores}
                  highlightUnscoredGames={checkScoreBrackets()}
                  highlightIncompletedGames={checkGame()}
                  onGameUpdate={(changes: any) =>
                    onGameUpdate({ ...game, ...changes })
                  }
                />
              )}
          </div>
        </DropContainer>
      </div>
    </td>
  );
};

export default RenderGameSlot;
