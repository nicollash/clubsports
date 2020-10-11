import React from "react";
import styles from "./styles.module.scss";
import { IBracketGame } from "../bracketGames";

interface IProps {
  leftGamesNum: number;
  rightGamesNum: number;
  hidden?: any[];
  games: IBracketGame[];
  negative?: boolean;
  displayNegative?: boolean;
}

const selectStyle = (num: number, games: IBracketGame[]) => {
  switch (num) {
    case 8:
      return styles.connectors8;
    case 4:
      return styles.connectors4;
    case 3:
      return styles.connectors3;
    case 2:
      return games[0].index === 4 && games[0].round === 2
        ? styles.connectors3before
        : styles.connectors2;
    default:
      return styles.connectors2;
  }
};

const getHiddenStyle = (hiddenTop: boolean, hiddenBottom: boolean) => {
  switch (true) {
    case hiddenTop && hiddenBottom:
      return styles.hidden;
    case hiddenTop && !hiddenBottom:
      return styles.hiddenTop;
    case !hiddenTop && hiddenBottom:
      return styles.hiddenBottom;
  }
};

const BracketConnector = (props: IProps) => {
  const {
    hidden,
    leftGamesNum,
    rightGamesNum,
    games,
    negative,
    displayNegative,
  } = props;
  const step = (negative ? rightGamesNum : leftGamesNum) || 0;

  const renderConnector = () => (
    <div
      key={Math.random()}
      className={`${styles.connector} ${
        negative || (leftGamesNum < rightGamesNum && displayNegative)
          ? styles.negativeConnector
          : ""
      }`}
    />
  );

  return (
    <div
      className={`${selectStyle(step, games)} ${
        displayNegative ? styles.negative : ""
      }`}
    >
      {hidden &&
        hidden.map(({ hiddenTop, hiddenBottom }) => (
          <div
            key={Math.random()}
            className={`${styles.connector} ${getHiddenStyle(
              hiddenTop,
              hiddenBottom
            )} ${
              (negative || leftGamesNum < rightGamesNum) &&
              styles.negativeConnector
            }`}
          />
        ))}

      {!hidden && [...Array(Math.round(step / 2))].map(renderConnector)}
    </div>
  );
};

export default BracketConnector;
