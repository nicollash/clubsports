import React from "react";
import { IGame } from "../../../matrix-table/helper";
import { IField } from 'common/models/schedule/fields';
import { BindingAction } from 'common/models';
import { Button, HeadingLevelTwo, Modal } from "components/common";

import styles from "./styles.module.scss";
import { IDupesGame } from '../..';

interface Props {
  isOpen: boolean;
  fields: IField[];
  dupeGames: IDupesGame[];
  onClose: BindingAction;
  onCancelClick: BindingAction;
}

const PopupDupesGames = ({
  isOpen,
  fields,
  dupeGames,
  onClose,
  onCancelClick,
}: Props) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <section className={styles.popupWrapper}>
      <HeadingLevelTwo>Duplicate games</HeadingLevelTwo>
      <div className={styles.sectionItem}>
        {dupeGames.map((game: IDupesGame, idx: number) => (
          <div key={idx} className={styles.gameContainer}>
            <p>
              <b>{game.games[0].awayTeam?.name}</b> ({game.games[0].awayTeam?.divisionShortName}) and &nbsp;
              <b>{game.games[0].homeTeam?.name}</b> ({game.games[0].homeTeam?.divisionShortName})
            </p>
            {game.games.map((item: IGame) => (
              <p className={styles.gameInfo}><i>{item.gameDate}</i>: {item.startTime} on the {fields.find((field: IField) => field.id === item.fieldId)?.name}</p>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.btnsWrapper}>
        <span className={styles.exitBtnWrapper}>
          <Button
            onClick={onCancelClick}
            label= "Cancel"
            variant="text"
            color="secondary"
          />
        </span>
      </div>
    </section>
  </Modal>
);

export default PopupDupesGames;