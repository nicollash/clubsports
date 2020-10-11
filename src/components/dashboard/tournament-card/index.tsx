import React from "react";
import { History } from "history";
import Paper from "../../common/paper";
import styles from "./style.module.scss";
import Button from "../../common/buttons/button";
import logo from "../../../assets/logo.png";
import { getTournamentStatusColor } from "../../../helpers/getTournamentStatusColor";
import moment from "moment";
import CircularProgress from "@material-ui/core/CircularProgress";
import { IEventDetails } from "common/models";
import { EventStatuses } from "common/enums";

interface ITournamentCardProps {
  event: IEventDetails;
  numOfTeams: number;
  numOfFields: number;
  numOfGameCount: number;
  numOfPlayerCount: number;
  numOfLocations: number;
  registrationStatus: boolean | null;
  lastScheduleRelease?: string;
  isDetailLoading: boolean;
  history: History;
}

const TournamentCard = ({
  event,
  history,
  isDetailLoading,
  numOfTeams,
  numOfFields,
  numOfGameCount,
  numOfPlayerCount,
  numOfLocations,
  lastScheduleRelease,
  registrationStatus,
}: ITournamentCardProps) => {
  const onTournamentManage = () => {
    history.push(`/event/event-details/${event.event_id}`);
  };

  const startDate = moment.utc(event.event_startdate).format("MM.DD.YYYY");
  const endDate = moment.utc(event.event_enddate).format("MM.DD.YYYY");

  return (
    <div className={styles.tournamentContainer}>
      <Paper>
        <div className={styles.tournamentHeader}>
          <div className={styles.cardImage}>
            <img
              alt="logo"
              className={styles.logo}
              src={
                !event.desktop_icon_URL
                  ? logo
                  : `https://tourneymaster.s3.amazonaws.com/public/${event.desktop_icon_URL}`
              }
            />
          </div>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {event.event_name || "Undefined Event"}
            </h2>
            <div className={styles.additionalMessage}>
              {`${startDate} - ${endDate}`}
            </div>
          </div>
          <div className={styles.buttonsGroup}>
            <Button
              label="Manage"
              variant="contained"
              color="primary"
              onClick={onTournamentManage}
            />
          </div>
        </div>
        <div className={styles.tournamentContent}>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Teams:</span>{" "}
            {!isDetailLoading ? (
              numOfTeams || "—"
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Locations:</span>{" "}
            {!isDetailLoading ? (
              numOfLocations || "—"
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Status:</span>{" "}
            {EventStatuses[event.is_published_YN] || "—"}{" "}
            <span
              className={styles.tournamentStatus}
              style={{
                ...getTournamentStatusColor(event.is_published_YN),
              }}
            />
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Players:</span>{" "}
            {!isDetailLoading ? (
              numOfPlayerCount || "—"
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Fields:</span>{" "}
            {!isDetailLoading ? (
              numOfFields || "—"
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>
              Last Schedule Release:
            </span>{" "}
            {!isDetailLoading ? (
              lastScheduleRelease ? (
                moment(lastScheduleRelease).format("MM.DD.YYYY, HH:mm")
              ) : (
                "—"
              )
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>Games Count:</span>{" "}
            {!isDetailLoading ? (
              numOfGameCount || "—"
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
          <div className={styles.tournamentContentItem}>
            <span className={styles.tournamentContentTitle}>
              Registration Status:
            </span>{" "}
            {!isDetailLoading ? (
              registrationStatus ? (
                "Open"
              ) : (
                "Closed"
              )
            ) : (
              <CircularProgress size={15} />
            )}
          </div>
        </div>
      </Paper>
    </div>
  );
};
export default TournamentCard;
