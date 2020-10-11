import React from 'react';
import { HeadingLevelThree, SectionDropdown } from 'components/common';
import { MenuTitles } from 'common/enums';
import HistoryTable from './history-table';
import styles from './styles.module.scss';
import Api from 'api/api';
import { Toasts } from 'components/common';
import { BindingCbWithOne } from 'common/models';

interface rowsNumFormat {
  events: Array<any>;
  pools: Array<any>;
  locations: Array<any>;
  games: Array<any>;
};

interface Props {
  isSectionsExpand: boolean;
  onDataLoaded: BindingCbWithOne<boolean>;
  onRerun: BindingCbWithOne<string | number>;
}

const History = ({ onDataLoaded, onRerun, isSectionsExpand }: Props) => {
  const [histories, setHistories] = React.useState<any[]>([]);

  React.useEffect(() => {
    getHistory();
  }, []);

  function getHistory() {
    Api.get('/ext_load_summary')
      .then(res => {
        setHistories(res);
      })
  }

  const getPks = async (jobId: string | number) => {
    let data: rowsNumFormat = {
      events: [],
      pools: [],
      locations: [],
      games: []
    };

    data.events = await Api.get(`/ext_events?job_id=${jobId}`);
    data.pools = await Api.get(`/ext_pools?job_id=${jobId}`);
    data.locations = await Api.get(`/ext_locations?job_id=${jobId}`);
    data.games = await Api.get(`/ext_games?job_id=${jobId}`);

    return data;
  }

  const rerunHandler = async (jobId: string | number, idtournament: string | number) => {
    await deleteHistory(jobId);
    onRerun(idtournament);
  }

  const deleteHistory = async (jobId: string | number) => {
    try {
      onDataLoaded(false);
      const rowNums = await getPks(jobId);

      rowNums.events.forEach((item) => {
        Api.delete(`/ext_events?row_num=${item.row_num}`);
      });

      rowNums.pools.forEach((item) => {
        Api.delete(`/ext_pools?row_num=${item.row_num}`);
      });

      rowNums.locations.forEach((item) => {
        Api.delete(`/ext_locations?row_num=${item.row_num}`);
      });

      rowNums.games.forEach((item) => {
        Api.delete(`/ext_games?row_num=${item.row_num}`);
      });

      Toasts.successToast('Successfully Deleted!');
      getHistory();
      onDataLoaded(true);
    }
    catch (err) {
      Toasts.errorToast(err.message);
    }
  }

  return (
    <SectionDropdown
      id={MenuTitles.TOURNEY_HISTORY_TITLE}
      type="section"
      panelDetailsType="flat"
      isDefaultExpanded={true}
      expanded={isSectionsExpand}
    >
      <HeadingLevelThree>
        <span className={styles.detailsSubtitle}>{MenuTitles.TOURNEY_HISTORY_TITLE}</span>
      </HeadingLevelThree>

      <HistoryTable onDelete={deleteHistory} onRerun={rerunHandler} histories={histories} />
    </SectionDropdown>
  )
};

export default History;