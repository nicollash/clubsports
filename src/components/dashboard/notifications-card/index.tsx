import React from 'react';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Paper from '../../common/paper';
import styles from '../timeline-card/style.module.scss';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { ICalendarEvent } from 'common/models';
import moment from 'moment';
import { Loader } from 'components/common';

interface INotificationCardState {
  currentData: ICalendarEvent[];
}

interface INotificationCardProps {
  data: ICalendarEvent[];
  areCalendarEventsLoading: boolean;
}

class NotificationsCard extends React.Component<
  INotificationCardProps,
  INotificationCardState
> {
  state = { currentData: [], loaded: true };

  componentDidUpdate(
    prevProps: INotificationCardProps,
    prevState: INotificationCardState
  ) {
    if (
      (this.props.data.length && !prevState.currentData.length) ||
      this.props.data !== prevProps.data
    ) {
      this.setState({
        currentData:
          this.state.currentData.length > 5
            ? this.props.data.slice(0, 10)
            : this.props.data.slice(0, 5),
      });
    }
  }

  onClick = () => {
    if (
      this.props.data?.length > this.state.currentData.length &&
      this.state.currentData.length <= 5
    ) {
      this.setState({ currentData: this.props.data?.slice(0, 10) });
    } else {
      this.setState({ currentData: this.state.currentData.slice(0, 5) });
    }
  };

  renderButton = () => {
    if (
      this.props.data?.length > this.state.currentData.length &&
      this.state.currentData.length <= 5
    ) {
      return (
        <ExpandMoreIcon
          className={styles.expand}
          fontSize="large"
          onClick={this.onClick}
        />
      );
    } else if (this.state.currentData.length > 5) {
      return (
        <ExpandLessIcon
          className={styles.expand}
          fontSize="large"
          onClick={this.onClick}
        />
      );
    }
  };

  render() {
    return (
      <Paper>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <NotificationsIcon fontSize="small" className={styles.cardIcon} />
            Reminders
          </div>
        </div>
        <ul className={styles.notificationsContainer}>
          {this.props.areCalendarEventsLoading && (
            <div className={styles.tmNotificationsContainer}>
              <Loader />
            </div>
          )}
          {this.state.currentData.length && !this.props.areCalendarEventsLoading
            ? this.state.currentData.map(
                (notification: ICalendarEvent, index: number) => (
                  <li key={index} className={styles.notification}>
                    <div className={styles.notificationMessage}>
                      <div>{notification.cal_event_title}</div>
                      <div className={styles.additionalMessage}>
                        {moment(notification.cal_event_datetime).format(
                          'MM.DD.YYYY, HH:mm'
                        )}
                      </div>
                    </div>
                  </li>
                )
              )
            : !this.props.areCalendarEventsLoading && (
                <div className={styles.noFoundWrapper}>
                  <span>There are no pending reminders yet.</span>
                </div>
              )}
        </ul>
        {this.renderButton()}
      </Paper>
    );
  }
}

export default NotificationsCard;
