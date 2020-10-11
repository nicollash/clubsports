/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Routes } from 'common/enums';
import { BindingAction, ICalendarEvent } from 'common/models';
import Menu from '../common/menu';
import Calendar from 'components/calendar';
import Utilities from 'components/utilities';
import CreateMessage from 'components/event-link/create-message';
import MobileScoring from 'components/mobile-scoring';
import Reports from 'components/reports';
import GamedayComplexities from 'components/gameday-complexities';
import ScrollTopButton from 'components/common/scroll-top-button';
import EventLink from 'components/event-link';
import Footer from 'components/footer';
import {
  getCalendarEvents,
  updateCalendarEvent,
} from 'components/calendar/logic/actions';
import {
  filterCalendarEvents,
  checkIfRemind,
} from 'components/calendar/logic/helper';
import { MenuList } from './logic/constants';
import Header from '../header';
import Dashboard from '../dashboard';
import Support from '../support';
import LibraryManager from '../library-manager';
import OrganizationsManagement from '../organizations-management';
import styles from './styles.module.scss';
import MyOrganizations from "components/my-organizations";

interface Props {
  getCalendarEvents: BindingAction;
  updateCalendarEvent: BindingAction;
  calendarEvents: ICalendarEvent[];
}

const AuthorizedPage = ({
  getCalendarEvents,
  calendarEvents,
  updateCalendarEvent,
}: Props) => {
  const location = useLocation();
  const [isFullScreent, changeFullScreen] = React.useState(false);
  const hideOnList = [Routes.MOBILE_SCORING];

  React.useEffect(() => {
    const value = !!hideOnList?.filter(el => location?.pathname.includes(el))
      ?.length;
    changeFullScreen(value);
  }, [location]);

  React.useEffect(() => {
    getCalendarEvents();
  }, []);

  React.useEffect(() => {
    if (calendarEvents) {
      const filteredCalendarEvents = filterCalendarEvents(calendarEvents);
      const interval = setInterval(() => {
        checkIfRemind(filteredCalendarEvents, updateCalendarEvent);
      }, 1000 * 60);
      return () => clearInterval(interval);
    }
  });

  return (
    <div className={styles.container}>
      {!isFullScreent && <Header />}
      <div
        className={styles.page}
        style={{
          display: !isFullScreent ? 'flex' : 'unset',
          flexGrow: !isFullScreent ? 1 : undefined,
          padding: !isFullScreent ? '15px 10% 0' : undefined,
        }}
      >
        <Menu list={MenuList} isAllowEdit={true} hideOnList={hideOnList} />
        <main
          className={styles.content}
          style={{
            flexGrow: !isFullScreent ? 1 : undefined,
            paddingLeft: !isFullScreent ? '30px' : undefined,
          }}
        >
          <Switch>
            <Route path={Routes.DASHBOARD} component={Dashboard} />
            <Route path={Routes.LIBRARY_MANAGER} component={LibraryManager} />
            <Route path={Routes.CREATE_MESSAGE} component={CreateMessage} />
            <Route path={Routes.COMMON_EVENT_LINK} component={EventLink} />
            <Route
              path={Routes.COLLABORATION}
              component={OrganizationsManagement}
            />
            <Route path={Routes.CALENDAR} component={Calendar} />
            <Route path={Routes.UTILITIES} component={Utilities} />
            <Route path={Routes.MY_ORGANIZATIONS} component={MyOrganizations} />
            <Route path={Routes.REPORTS} component={Reports} />
            <Route
              path={Routes.EVENT_DAY_COMPLEXITIES}
              component={GamedayComplexities}
            />
            <Route
              path={Routes.ORGANIZATIONS_MANAGEMENT}
              component={OrganizationsManagement}
            />
            <Route path={Routes.SUPPORT} component={Support} />
            <Route path={Routes.MOBILE_SCORING} component={MobileScoring} />
            <Route path={Routes.DEFAULT} component={Dashboard} />
          </Switch>
          {!isFullScreent && <ScrollTopButton />}
        </main>
      </div>
      {!isFullScreent && <Footer />}
    </div>
  );
};

const mapStateToProps = (state: {
  calendar: { events: ICalendarEvent[] };
}) => ({
  calendarEvents: state.calendar.events,
});

const mapDispatchToProps = {
  getCalendarEvents,
  updateCalendarEvent,
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthorizedPage);
