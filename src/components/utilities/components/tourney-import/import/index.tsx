import React from 'react';
import styles from './styles.module.scss';
import { MenuTitles } from 'common/enums';
import { HeadingLevelThree, SectionDropdown, Input } from 'components/common';
import { BindingAction, BindingCbWithOne } from 'common/models';
import FullWidthTabs from './tab';
import JobStatus from './tables/job-status';
import { Button } from 'components/common';
import { ButtonVariant, ButtonColors, ButtonFormTypes } from 'common/enums';
import history from '../../../../../browserhistory';
import LinearProgress from '@material-ui/core/LinearProgress';

interface Props {
  onGetTid: BindingCbWithOne<any>;
  jobStatus: Array<string>;
  events: any;
  games: any;
  locations: any;
  onDataLoaded: BindingCbWithOne<any>;
  dataLoaded: Boolean;
  onPreview: BindingAction;
  onCommit: any;
  completed: any;
  isSectionsExpand: boolean;
}

const TourneyImport: React.FC<Props> = ({
  onGetTid,
  jobStatus,
  events,
  games,
  locations,
  onDataLoaded,
  dataLoaded,
  onPreview,
  onCommit,
  completed,
  isSectionsExpand,
}) => {
  const [showData, setShowData] = React.useState(false);

  React.useEffect(() => {
    if (events.length !== 0 && games.length !== 0 && locations.length !== 0) {
      setShowData(true);
      onDataLoaded(true);
    }
  }, [events, games, locations, onDataLoaded]);

  return (
    <SectionDropdown
      id={MenuTitles.TOURNEY_IMPORT_TITLE}
      type="section"
      panelDetailsType="flat"
      isDefaultExpanded={true}
      expanded={isSectionsExpand}
    >
      <HeadingLevelThree>
        <span className={styles.detailsSubtitle}>
          {MenuTitles.TOURNEY_IMPORT_TITLE}
        </span>
      </HeadingLevelThree>
      <div className={styles.tournanment}>
        {!dataLoaded ? (
          <div className={styles.tournanmentHeader}>
            <Input
              onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
                onGetTid(evt.target.value)
              }
              label="Enter the Identifier of the External Tournament: "
              fullWidth={true}
            />

            <div className={styles.buttonGroup}>
              <Button
                label="Cancel"
                onClick={() => history.push('/dashboard')}
                variant="text"
                color={ButtonColors.SECONDARY}
                btnType={ButtonFormTypes.SUBMIT}
              />
              <Button
                label="Submit"
                onClick={onPreview}
                variant={ButtonVariant.CONTAINED}
                color={ButtonColors.PRIMARY}
                btnType={ButtonFormTypes.SUBMIT}
              />
            </div>
          </div>
        ) : null}
        {jobStatus.length ? (
          <div className={styles.tournanmentBody}>
            <LinearProgress variant="determinate" value={completed} />
            <br />
            <div className={styles.tabHeader}>
              <SectionDropdown
                id="Status"
                type="section"
                panelDetailsType="flat"
                isDefaultExpanded={true}
              >
                <h5>Status</h5>
                <JobStatus statuses={jobStatus} />
              </SectionDropdown>
            </div>
            {showData ? (
              <>
                <div className={styles.buttonGroup2}>
                  <Button
                    label="Cancel"
                    variant="text"
                    color={ButtonColors.SECONDARY}
                    btnType={ButtonFormTypes.SUBMIT}
                  />
                  <Button
                    label="Commit"
                    onClick={onCommit}
                    variant={ButtonVariant.CONTAINED}
                    color={ButtonColors.PRIMARY}
                    btnType={ButtonFormTypes.SUBMIT}
                  />
                </div>
                <FullWidthTabs
                  events={events}
                  locations={locations}
                  games={games}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionDropdown>
  );
};

export default TourneyImport;
