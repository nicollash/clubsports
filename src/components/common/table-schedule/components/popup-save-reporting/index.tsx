import React from 'react';
import PDFTableSchedule from 'pdg-layouts/table-schedule';
import PDFTableFieldsSchedule from 'pdg-layouts/table-fields-schedule';
import {
  Modal,
  HeadingLevelTwo,
  ButtonLoad,
  Button,
  SelectMultiple,
  CardMessage,
} from 'components/common';
import { CardMessageTypes } from 'components/common/card-message/types';
import { onPDFSave, getSelectDayOptions, getGamesByDays, onXLSXSave } from 'helpers';
import { BindingAction, IPool } from 'common/models';
import { ButtonColors, ButtonVariant, DefaultSelectValues, TableScheduleTypes } from 'common/enums';
import { IEventDetails, ISchedule } from 'common/models';
import { IGame, settleTeamsPerGamesDays } from 'components/common/matrix-table/helper';
import { IField } from 'common/models/schedule/fields';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IScheduleFacility } from 'common/models/schedule/facilities';
import styles from './styles.module.scss';
import { ITeamCard } from 'common/models/schedule/teams';
import { getScheduleTableXLSX, TableType } from 'components/reporting/helpers';
import { getScorers } from "pdg-layouts/helpers";

const STYLES_ICOM_WARNING = {
  fill: '#FFCB00',
  height: '25px',
  width: '30px',
};

interface Props {
  pools?: IPool[];
  event: IEventDetails;
  timeSlots: ITimeSlot[];
  tableType?: string;
  facilities: IScheduleFacility[];
  games: IGame[];
  fields: IField[];
  schedule: ISchedule;
  teamCards: ITeamCard[];
  eventDays: string[];
  isOpen: boolean;
  onClose: BindingAction;
}

const PopupSaveReporting = ({
  pools,
  event,
  facilities,
  tableType,
  timeSlots,
  teamCards,
  games,
  fields,
  schedule,
  eventDays,
  isOpen,
  onClose,
}: Props) => {
  const [isAllowDownload, changeAllowDownload] = React.useState<boolean>(true);
  const [activeDay, changeActiveDay] = React.useState<string[]>([
    DefaultSelectValues.ALL,
  ]);

  React.useEffect(() => {
    changeAllowDownload(activeDay.length > 0);
  }, [activeDay]);

  const filledGames: IGame[][] = [];

  for (let day of eventDays) {
    filledGames.push(settleTeamsPerGamesDays(games, teamCards, day!));
  };

  const gamesByDay = tableType === "scores" ? getGamesByDays(filledGames.flat(), activeDay) : getGamesByDays(games, activeDay);
  const selectDayOptions = getSelectDayOptions(eventDays);

  const onChangeActiveDay = (avtiveDay: string[] | null) => {
    if (activeDay) {
      changeActiveDay(avtiveDay as string[]);
    }
  };

  let scorerMobile = '';
  getScorers(event.event_id).then((res) => (scorerMobile = res));
  
  const onScheduleTableSave = () =>
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        timeSlots={timeSlots}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        scorerMobile={scorerMobile}
      />,
      event.event_name ? `${event.event_name} Master Schedule` : 'Schedule'
    );

  const onScoringTableSave = () => 
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        timeSlots={timeSlots}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        scorerMobile={scorerMobile}
      />,
      event.event_name
        ? `${event.event_name} Master Schedule Score - PDF`
        : 'Score'
    );

  const onHeatmapTableSave = (type: TableScheduleTypes) => {
    const name = event.event_name
      ? `${event.event_name} Master ${
          type === TableScheduleTypes.SCHEDULES ? "Schedule" : "Scores"
        } (HeatMap)`
      : type === TableScheduleTypes.SCHEDULES
      ? "Schedule"
      : "Srores";
    onPDFSave(
      <PDFTableSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        timeSlots={timeSlots}
        facilities={facilities}
        schedule={schedule}
        teamCards={teamCards}
        isHeatMap={true}
        scorerMobile={scorerMobile}
      />,
      name
    );
  };

  const onScheduleFieldsSave = () =>
    onPDFSave(
      <PDFTableFieldsSchedule
        event={event}
        games={gamesByDay}
        fields={fields}
        timeSlots={timeSlots}
        facilities={facilities}
        schedule={schedule}
        scorerMobile={scorerMobile}
      />,
      event.event_name
        ? `${event.event_name} Master Fields Schedule`
        : 'FieldsSchedule'
    );

  const onScoringTableXLSXSave = async () => {
    const { header, body } = await getScheduleTableXLSX(
      event,
      schedule,
      gamesByDay,
      teamCards,
      facilities,
      fields,
      pools!,
      TableType.SCORING,
    );
    
    onXLSXSave(header, body, 'Master Schedule Score - XLSX');
  };

  const scoresDownload = (
    <>
      <li className={styles.dowloadLinkWrapper}>
        <b>Master Schedule Scores - PDF</b>
        <ButtonLoad
          loadFunc={onScoringTableSave}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="Download"
        />
      </li>
      <li className={styles.dowloadLinkWrapper}>
        <b>Master Schedule Scores - XLSX</b>
        <ButtonLoad
          loadFunc={onScoringTableXLSXSave}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          label="Download"
        />
      </li>
      <li className={styles.dowloadLinkWrapper}>
        <b>Master Schedule Scores(Colored Heatmap)</b>
        <ButtonLoad
          loadFunc={() => onHeatmapTableSave(TableScheduleTypes.SCORES)}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          isDisabled={!isAllowDownload}
          label="Download"
        />
      </li>
    </>);

  const schedulesDownload = (
    <>
      <li className={styles.dowloadLinkWrapper}>
        <b>Master Schedule (no colors)</b>
        <ButtonLoad
          loadFunc={onScheduleTableSave}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          isDisabled={!isAllowDownload}
          label="Download"
        />
      </li>
      <li className={styles.dowloadLinkWrapper}>
        <b>Master Schedule (Colored Heatmap)</b>
        <ButtonLoad
          loadFunc={() => onHeatmapTableSave(TableScheduleTypes.SCHEDULES)}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.SECONDARY}
          isDisabled={!isAllowDownload}
          label="Download"
        />
      </li>
    </>);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <header className={styles.headerWrapper}>
          <HeadingLevelTwo>Select:</HeadingLevelTwo>
          <SelectMultiple
            options={selectDayOptions}
            value={activeDay}
            onChange={onChangeActiveDay}
            primaryValue={DefaultSelectValues.ALL}
            isFormControlRow={true}
            label="Date Selection: "
          />
        </header>
        <ul className={styles.linkList}>
          <li className={styles.link}>
            <h3>Full Schedule:</h3>
            <ul className={styles.downloadLinkList}>
              { tableType && tableType === 'scores'
                  ? scoresDownload
                  : schedulesDownload
              }
            </ul>
          </li>
          {!tableType 
            ? (
                <li className={styles.link}>
                  <h3>Fields Schedule: </h3>
                  <ul className={styles.downloadLinkList}>
                    <li className={styles.dowloadLinkWrapper}>
                      <b>Field-by-Field Schedule</b>
                      <ButtonLoad
                        loadFunc={onScheduleFieldsSave}
                        variant={ButtonVariant.TEXT}
                        color={ButtonColors.SECONDARY}
                        isDisabled={!isAllowDownload}
                        label="Download"
                      />
                    </li>
                  </ul>
                </li>
              )
            : null
          }
          
        </ul>
        {!isAllowDownload && !tableType && (
          <CardMessage
            type={CardMessageTypes.WARNING}
            iconStyle={STYLES_ICOM_WARNING}
          >
            Select day to download PDF-files
          </CardMessage>
        )}
        <div className={styles.btnWrapper}>
          <Button
            onClick={onClose}
            variant={ButtonVariant.TEXT}
            color={ButtonColors.SECONDARY}
            label="Cancel"
          />
        </div>
      </section>
    </Modal>
  );
};

export default PopupSaveReporting;
