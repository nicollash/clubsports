﻿import React from "react";
import { IIndividualsRegister, ITeamsRegister } from "common/models/register";
import styles from "../styles.module.scss";
import { IEventDetails, ISelectOption, ITeamItem } from "common/models";
import moment from "moment";
import { InternalRegType } from "common/enums";

interface IConfirmationProps {
  type: InternalRegType;
  data: Partial<IIndividualsRegister & ITeamsRegister>;
  event: IEventDetails | null;
  divisions: ISelectOption[];
  teams?: ITeamItem[];
}

const Confirmation = ({
  data,
  event,
  divisions,
  type,
  teams,
}: IConfirmationProps) => {
  const getYears = () => {
    if (!data.player_birthdate) {
      return '';
    }
    const birthdate = Math.floor((+new Date() - +new Date(data.player_birthdate)) / 1000 / 60 / 60 / 24 / 365);
    return birthdate;
  };

  const getDivision = () => {
    const division = divisions.find((item) => item.value === data.ext_sku);
    return division ? division.label : '';
  };

  return (
    <div className={styles.confirmWrapp}>
      <div className={styles.confSideWrapp}>
        <div className={styles.confSide}>
          To confirm, you are registering for the <b>{event?.event_name}</b>{" "}
          starting on <b>{moment.utc(event?.event_startdate).format("LL")}</b>.
          Please confirm that the all these details are accurate to proceed to
          the final step (Payment).
        </div>
      </div>
      <div>
        {type === InternalRegType.INDIVIDUAL &&
          <div className={styles.confMain}>
            <div className={styles.label}>Participant Details:</div>
            <div className={styles.confirmCol}>
              <div className={styles.confirmFieldMain}>Name:</div>
              <div className={styles.confirmFieldMain}>Current Age: </div>
              <div className={styles.confirmFieldMain}>Email: </div>
              <div className={styles.confirmFieldMain}>Phone Number: </div>
              <div className={styles.confirmFieldMain}>Group/Division: </div>
            </div>
            <div className={styles.confirmCol}>
              <div className={styles.confirmField}>
                {data.participant_first_name} {data.participant_last_name}
              </div>
              <div className={styles.confirmField}>{getYears()}</div>
              <div className={styles.confirmField}>{data.participant_email}</div>
              <div className={styles.confirmField}>{data.participant_mobile}</div>
              <div className={styles.confirmField}>{getDivision()}</div>
            </div>
          </div>
        }
        {type === InternalRegType.TEAM &&
          teams?.map((team) => (
            <div className={styles.confMain} key={team.id}>
              <div className={styles.label}>Team "{team.team_name}" Admin Details:</div>
              <div className={styles.confirmCol}>
                <div className={styles.confirmFieldMain}>Team Name:</div>
                <div className={styles.confirmFieldMain}>Division: </div>
                <div className={styles.confirmFieldMain}>Admin Contact Name: </div>
                <div className={styles.confirmFieldMain}>Admin Contact Email: </div>
                <div className={styles.confirmFieldMain}>Admin Contact Phone: </div>
              </div>
              <div className={styles.confirmCol}>
                <div className={styles.confirmField}>{team.team_name}</div>
                <div className={styles.confirmField}>{team.division_name}</div>
                <div className={styles.confirmField}>
                  {team.coach_first_name} {team.coach_last_name}
                </div>
                <div className={styles.confirmField}>{team.coach_email}</div>
                <div className={styles.confirmField}>{team.coach_mobile}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Confirmation;

