import React, { useState, useEffect } from 'react';
import { Select, Loader } from 'components/common';
import SectionGames from './section-games';
import Api from 'api/api';
import { IEventDetails, ISchedule } from 'common/models';
import { ScheduleStatuses } from 'common/enums';
import { IInputEvent } from 'common/types';
import styles from './styles.module.scss';
import { getEventOptions } from './helpers';

const MobileScoring = () => {
  const [isLoadingEvent, changeLoading] = useState(false);
  const [events, setEvents] = useState<IEventDetails[]>([]);
  const [activeEvent, changeActiveEvent] = useState<IEventDetails | null>(null);

  useEffect(() => {
    (async () => {
      changeLoading(true);
      const events = (await Api.get('/events')) as IEventDetails[];
      const schedules = (await Api.get('/schedules')) as ISchedule[];

      const publishedSchedules = schedules.filter(
        (schedule: ISchedule) =>
          schedule.is_published_YN === ScheduleStatuses.Published
      );

      const publishedEvents = events.filter((event: IEventDetails) => {
        const isPublishedSchedule = publishedSchedules.some(
          (schedule: ISchedule) => schedule.event_id === event.event_id
        );

        return isPublishedSchedule;
      });

      setEvents(publishedEvents);
      changeLoading(false);
    })();
  }, []);

  const onChangeActiveEvent = (evt: IInputEvent) => {
    const activeEvent = events.find(it => it.event_id === evt.target.value);

    changeActiveEvent(activeEvent || null);
  };

  const eventOptions = getEventOptions(events);

  return (
    <div className={styles.main}>
      <h1 className={styles.mainTitle}>Mobile Scoring</h1>

      {isLoadingEvent ? (
        <Loader />
      ) : (
        <>
          <section className={styles.eventSelectWrapper}>
            <h2 className={styles.eventSelectTitle}>Event:</h2>
            <Select
              onChange={onChangeActiveEvent}
              value={activeEvent?.event_id || ''}
              options={eventOptions}
              width="100%"
              isFullWith={true}
            />
          </section>
          {activeEvent && <SectionGames event={activeEvent} />}
        </>
      )}
    </div>
  );
};

export default MobileScoring;
