import React from 'react';
import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import StarIcon from '@material-ui/icons/Star';

import { HeadingLevelTwo, HeadingLevelFour } from 'components/common';
import { Routes } from 'common/enums';
import { IReport } from 'common/models';

import styles from './styles.module.scss';

export interface ReportBrowserProps {
  reports: IReport[];
}

const ReportsBrowser: React.SFC<ReportBrowserProps> = ({ reports }) => {
  const groups = Array.from(new Set(reports.map(x => x.reporting_group1)));

  return (
    <>
      <div className={styles.heading}>
        <HeadingLevelTwo>TourneyMaster Reports</HeadingLevelTwo>
      </div>
      {groups.map(group => (
        <div key={group}>
          <HeadingLevelFour>{group}</HeadingLevelFour>
          <List component='nav' className={styles.root} aria-label='reports'>
            {reports
              .filter(report => report.reporting_group1 === group)
              .map(report => {
                return (
                  <Link
                    to={Routes.REPORTS + '/' + report.report_id}
                    key={report.report_id}
                  >
                    <ListItem>
                      {report?.is_favorite_YN ? (
                        <ListItemIcon>
                          <StarIcon />
                        </ListItemIcon>
                      ) : (
                        <ListItemIcon>
                          <div></div>
                        </ListItemIcon>
                      )}
                      <ListItemText>{report.report_name}</ListItemText>
                    </ListItem>
                  </Link>
                );
              })}
          </List>
        </div>
      ))}
    </>
  );
};

export default ReportsBrowser;
