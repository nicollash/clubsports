import React from 'react';
import { Switch, Route } from 'react-router-dom';
import withProtectedRoute from '../hocs/withProtectedRoute';
import withUnprotectedRoute from '../hocs/withUnprotectedRoute';
import LoginPage from './login-page';
import AuthorizedPage from './authorized-page';
import { Routes } from 'common/enums';
import AuthorizedPageEvent from './authorized-page/authorized-page-event';
import Toastr from 'components/common/toastr';
import EventSearch from 'components/register-page/event-search';
import { wrappedRegister } from 'components/register-page';
import { LicenseManager } from 'ag-grid-enterprise';

const LoginPageWrapped = withUnprotectedRoute(LoginPage);
const AuthorizedPageWrapped = withProtectedRoute(AuthorizedPage);
const AuthorizedPageEventWrapped = withProtectedRoute(AuthorizedPageEvent);

LicenseManager.setLicenseKey(
  'For_Trialing_ag-Grid_Only-Not_For_Real_Development_Or_Production_Projects-Valid_Until-20_September_2020_[v2]_MTYwMDU1NjQwMDAwMA==dae7c5b7e06bcbecbcf9cb824e055293'
);

const App: React.FC = () => {
  return (
    <React.Fragment>
      <Switch>
        <Route path={Routes.LOGIN} component={LoginPageWrapped} exact={true} />
        <Route path={Routes.REGISTER} component={EventSearch} exact={true} />
        <Route
          path={Routes.EVENT_REGISTER}
          component={wrappedRegister}
          exact={true}
        />
        <Route
          path={[
            Routes.DASHBOARD,
            Routes.LIBRARY_MANAGER,
            Routes.COMMON_EVENT_LINK,
            Routes.CREATE_MESSAGE,
            Routes.COLLABORATION,
            Routes.CALENDAR,
            Routes.UTILITIES,
            Routes.REPORTS,
            Routes.EVENT_DAY_COMPLEXITIES,
            Routes.ORGANIZATIONS_MANAGEMENT,
            Routes.MOBILE_SCORING,
            Routes.MY_ORGANIZATIONS,
          ]}
          component={AuthorizedPageWrapped}
        />
        <Route
          path={[
            Routes.EVENT_DETAILS_ID,
            Routes.FACILITIES_ID,
            Routes.REGISTRATION_ID,
            Routes.DIVISIONS_AND_POOLS_ID,
            Routes.ADD_DIVISION,
            Routes.EDIT_DIVISION,
            Routes.TEAMS_ID,
            Routes.CREATE_TEAM,
            Routes.CREATE_PLAYER,
            Routes.SCHEDULING_ID,
            Routes.SCORING_ID,
            Routes.REPORTING_ID,
            Routes.RECORD_SCORES_ID,
            Routes.SCHEDULES_ID,
            Routes.PLAYOFFS_ID,
            Routes.EVENT_LINK_ID,
            Routes.CREATE_MESSAGE_ID,
          ]}
          component={AuthorizedPageEventWrapped}
        />
        <Route path={Routes.DEFAULT} component={AuthorizedPageWrapped} />
      </Switch>
      <Toastr />
    </React.Fragment>
  );
};

export default App;
