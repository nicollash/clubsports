/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { maxBy } from "lodash-es";
import { Button, Modal, Select } from "components/common";
import { BindingAction } from "common/models";
import styles from "./styles.module.scss";
import { IInputEvent } from "common/types";
import { IBracketGame } from "../bracketGames";

export interface IOnAddGame {
  awayDependsUpon: string;
  homeDependsUpon: string;
  gridNum: number;
  isWinner: boolean;
}

interface Props {
  isOpen: boolean;
  playInGamesExist: boolean;
  bracketGames: IBracketGame[];
  onClose: BindingAction;
  onAddGame: (data: IOnAddGame) => void;
}

const AddGameModal = ({
  isOpen,
  onClose,
  bracketGames,
  onAddGame,
  playInGamesExist,
}: Props) => {
  const [awaySourceOptions, setAwaySourceOptions] = React.useState<
    { label: string; value: number }[] | []
  >([]);
  const [homeSourceOptions, setHomeSourceOptions] = React.useState<
    { label: string; value: number }[] | []
  >([]);

  const [awaySourceSelected, setAwaySourceSelected] = React.useState<
    string | ""
  >("");
  const [homeSourceSelected, setHomeSourceSelected] = React.useState<
    string | ""
  >("");

  const calculateSourceValues = () => {
    const negativeRounds = bracketGames
      .map((item) => item.round)
      .filter((item) => item <= 0);

    const source = bracketGames.map((item) => ({
      label: `Loser Game ${item.index}, Round ${
        Math.abs(item.round || 0) + (item.round < 1 ? 2 : 0)
      }`,
      value: -item.index,
    }));

    if (negativeRounds?.length) {
      source.push(
        ...bracketGames
          .filter((item) => item.round <= 0)
          .map((item) => ({
            label: `Winner Game ${item.index}, Round ${
              Math.abs(item.round || 0) + (item.round < 1 ? 2 : 0)
            }`,
            value: item.index,
          }))
      );
    }

    return source;
  };

  useEffect(() => {
    const source = calculateSourceValues();
    setAwaySourceOptions(source);
    setHomeSourceOptions(source);
  }, [bracketGames]);

  useEffect(() => {
    const awaySourceIndex = Number(awaySourceSelected);
    const homeSourceIndex = Number(homeSourceSelected);

    const source = calculateSourceValues();

    const findGameIdsBySelectedSource = (
      bracketGames: IBracketGame[],
      selectedIndex: number
    ) => {
      const isWinningGame = selectedIndex > 0;
      const selectedIndexAbs = Math.abs(selectedIndex);

      const foundGameIds = bracketGames
        .filter(
          (item) =>
            (item.awayDependsUpon === selectedIndexAbs ||
              item.homeDependsUpon === selectedIndexAbs) &&
            (isWinningGame ? item.round >= 0 : item.round < 0)
        )
        .map((item) =>
          item.awayDependsUpon === selectedIndexAbs
            ? item.homeDependsUpon
            : item.awayDependsUpon
        )
        .filter((item) => item !== undefined && item >= 0);
      foundGameIds.unshift(selectedIndexAbs);

      return source.filter(
        (item) => !foundGameIds.includes(Math.abs(item.value))
      );
    };

    const newAwaySourceOptions = findGameIdsBySelectedSource(
      bracketGames,
      homeSourceIndex
    );
    const newHomeSourceOptions = findGameIdsBySelectedSource(
      bracketGames,
      awaySourceIndex
    );

    setAwaySourceOptions(newAwaySourceOptions);
    setHomeSourceOptions(newHomeSourceOptions);
  }, [awaySourceSelected, homeSourceSelected]);

  const onAwaySourceChange = (e: IInputEvent) =>
    setAwaySourceSelected(e.target.value);
  const onHomeSourceChange = (e: IInputEvent) =>
    setHomeSourceSelected(e.target.value);

  const addGame = () => {
    const awaySourceSelectedNum = Number(awaySourceSelected);
    const homeSourceSelectedNum = Number(homeSourceSelected);

    const maxGridNum = maxBy(bracketGames, "gridNum")?.gridNum;

    const awaySource = bracketGames.find(
      (item) => item.index === Math.abs(awaySourceSelectedNum)
    );
    const homeSource = bracketGames.find(
      (item) => item.index === Math.abs(homeSourceSelectedNum)
    );

    const awaySourceGrid = awaySource?.gridNum || 1;
    const homeSourceGrid = homeSource?.gridNum || 1;
    const awaySourceRound = awaySource?.round;
    const homeSourceRound = homeSource?.round;

    const isWinner = awaySourceSelectedNum > 0 && homeSourceSelectedNum > 0;
    const gridNum =
      awaySourceGrid === homeSourceGrid &&
      awaySourceRound === homeSourceRound &&
      (awaySourceRound || 0) <= 1 &&
      !(awaySourceGrid === 1 && awaySourceSelectedNum > 0) &&
      !playInGamesExist
        ? awaySourceGrid!
        : (maxGridNum || 1) + 1;
    onAddGame({
      awayDependsUpon: String(Math.abs(awaySourceSelectedNum)),
      homeDependsUpon: String(Math.abs(homeSourceSelectedNum)),
      gridNum,
      isWinner,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.popupWrapper}>
        <h2 className={styles.title}>Add Bracket Game</h2>
        <div className={styles.bodyWrapper}>
          <Select
            options={awaySourceOptions}
            value={awaySourceSelected}
            placeholder="Select"
            label="Away Team; Select First Game Source"
            onChange={onAwaySourceChange}
          />
          <Select
            options={homeSourceOptions}
            value={homeSourceSelected}
            placeholder="Select"
            label="Home Team; Select Second Game Source"
            onChange={onHomeSourceChange}
          />
        </div>
        <div className={styles.btnsWrapper}>
          <Button
            label="Cancel"
            variant="text"
            color="secondary"
            onClick={onClose}
          />
          <Button
            label="+ Add"
            variant="contained"
            color="primary"
            onClick={addGame}
            disabled={!awaySourceSelected || !homeSourceSelected}
          />
        </div>
      </section>
    </Modal>
  );
};

export default AddGameModal;
