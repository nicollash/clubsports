/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import Import from './import';
import History from './history';
import { Loader, Toasts } from 'components/common';
import Api from 'api/api';

interface Props {
  isSectionsExpand: boolean;
};

const TourneyImportWizard = ({ isSectionsExpand }: Props) => {
  const [tournamentLoaded, SetTournamentLoaded] = React.useState(true);
  const [historyLoaded, setHistoryLoaded] = React.useState(true);
  const [idTournament, setIdTournament] = React.useState<string | number>('');
  const [jobId, setJobId] = React.useState<string>('');
  const [jobStatus, setJobStatus] = React.useState<any[]>([]);
  const [events, setEvents] = React.useState<any[]>([]);
  const [games, setGames] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState<Boolean>(false);
  const [completed, setCompleted] = React.useState(0);

  React.useEffect(() => {
    function progress() {
      setCompleted(oldCompleted => {
        const diff = Math.random() * 0.6;
        return Math.min(oldCompleted + diff, 100);
      });
    }

    const timer = setInterval(progress, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  function startJob() {
    if (
      idTournament === '' ||
      idTournament === null ||
      idTournament === undefined
    )
      return false;

    SetTournamentLoaded(false);
    Api.post(`/tourneymachine?tid=${idTournament}`, null)
      .then(res => {
        setJobId(res.message.job_id);
        getStatus(res.message.job_id);
      })
      .catch(err => {
        console.log('[On job failed]', err);
      });
  }

  const commitImport = async () => {
    Api.post(`/tm_commit?job_id=${jobId}`, null)
      .then(res => {
        // Do whetever needs to be done after commit
        console.log(res);
        Toasts.successToast('Success');
      })
      .catch(error => {
        console.log(error);
        Toasts.errorToast('Fail');
      });
  };

  function reRunHandler(tournamentid: string | number) {
    setIdTournament(tournamentid);
    Api.post(`/tourneymachine?tid=${tournamentid}`, null)
      .then(res => {
        setJobId(res.message.job_id);
        getStatus(res.message.job_id);
      })
      .catch(err => {
        console.log('[On job failed]', err);
      });
  }

  function getStatus(job_id: string) {
    const localJobId = job_id;

    Api.get(`/system_jobs_view?job_id=${localJobId}`).then(res => {
      SetTournamentLoaded(true);
      dataLoadedHandler(true);
      let filteredArr: Array<any> = [];
      res.forEach(function(value: any) {
        if (value.step_description && value.step_comments)
          filteredArr.push(value);
      });
      setJobStatus(filteredArr);

      if (res[0].is_complete_YN === 1) {
        setCompleted(100);
        getTournamentData(localJobId);
      } else {
        setTimeout(() => getStatus(localJobId), 5000);
      }
    });
  }

  function getTournamentData(jobId: string) {
    Api.get(`/ext_events?job_id=${jobId}`)
      .then(res => {
        setEvents(res);
      })
      .catch(err => {
        console.log(err);
      });

    Api.get(`/ext_games?job_id=${jobId}`)
      .then(res => {
        setGames(res);
      })
      .catch(err => {
        console.log(err);
      });

    Api.get(`/ext_locations?job_id=${jobId}`)
      .then(res => {
        setLocations(res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  function dataLoadedHandler(dataLoadedProp: Boolean) {
    setDataLoaded(dataLoadedProp);
  }

  function getTid(tId: string) {
    setIdTournament(tId);
  }

  function historycalLoadHandler(value: boolean) {
    setHistoryLoaded(value);
  }

  if (!tournamentLoaded || !historyLoaded) {
    return <Loader />;
  }

  return (
    <>
      <Import
        onGetTid={getTid}
        jobStatus={jobStatus}
        events={events}
        games={games}
        locations={locations}
        onDataLoaded={dataLoadedHandler}
        dataLoaded={dataLoaded}
        onPreview={startJob}
        onCommit={commitImport}
        completed={completed}
        isSectionsExpand={isSectionsExpand}
      />

      <History
        onDataLoaded={historycalLoadHandler}
        onRerun={reRunHandler}
        isSectionsExpand={isSectionsExpand}
      />
    </>
  );
};

export default TourneyImportWizard;
