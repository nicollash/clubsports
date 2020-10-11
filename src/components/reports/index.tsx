import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';

import { IReport } from 'common/models';
import { Routes } from 'common/enums';
import ReportsBrowser from './components/reports-browser';
import ReportView from './components/report-view';
import { loadReports } from './logic/actions';

export interface ReportsProps {
  reports: IReport[];
  loadReports: () => void;
}

const Reports: React.SFC<ReportsProps> = ({ reports, loadReports }) => {
  useEffect(() => {
    if (reports?.length === 0) {
      loadReports();
    }
  }, [reports, loadReports]);
  return (
    <>
      <Switch>
        <Route path={Routes.REPORT_ID} component={ReportView} />
        <Route
          path={Routes.REPORTS}
          render={() => <ReportsBrowser reports={reports} />}
        />
      </Switch>
    </>
  );
};

interface IReportsState {
  reports: { reports: IReport[] };
}

const mapStateToProps = (state: IReportsState) => ({
  reports: state.reports.reports,
});

const mapDispatchToProps = {
  loadReports,
};

export default connect(mapStateToProps, mapDispatchToProps)(Reports);
