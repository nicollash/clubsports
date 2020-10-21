/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { HeadingLevelTwo, Button } from 'components/common';
import styles from './styles.module.scss';
import Navigation from './navigation';
import Messaging from './messaging';
import ScheduleReview from './schedule-review';
import {
  getData,
  getMessages,
  deleteMessages,
  refreshMessage,
  getResponses,
  updateMessage,
} from './logic/actions';
import { BindingCbWithOne, IDivision, IPool, ITeam } from 'common/models';
import { IMessage } from 'common/models/event-link';
import { RouteComponentProps } from "react-router-dom";

export interface IResponse {
  answerText: string;
  messageStatus: string;
  receivedDatetime: string | Date;
  sendDatetime: string | Date;
  messageId: string;
  recipientTarget: string;
  statusMessage: string;
};

interface MatchParams {
  eventId: string;
}
export interface IGroupedMessages {
  message_title: string;
  message_type: string;
  message_body: string;
  message_ids: string[];
  uniqueIds: (string | null)[];
  recipients: string[];
  sendDatetime: string;
  status: number;
  senderName: string;
}

interface IProps {
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  getMessages: (eventId: string) => void;
  getResponses: (messageId: string) => void;
  getData: () => void;
  deleteMessages: BindingCbWithOne<string>;
  refreshMessage: (messageId: string) => void;
  updateMessage: (messageId: string) => void;
  messages: IMessage[];
  messagesAreLoading: boolean;
  responses: IResponse[];
}

const EventLink = ({
  divisions,
  pools,
  teams,
  responses,
  match,
  getMessages,
  getResponses,
  messages,
  messagesAreLoading,
  deleteMessages,
  refreshMessage,
  getData,
  updateMessage,
}: IProps & RouteComponentProps<MatchParams>) => {
  const eventId = match.params.eventId;
  useEffect(() => {
    getMessages(eventId);
    getData();
  }, []);

  const [isSectionsExpand, toggleSectionCollapse] = useState<boolean>(true);

  const onToggleSectionCollapse = () => {
    toggleSectionCollapse(!isSectionsExpand);
  };

  return (
    <section className={styles.container}>
      <Navigation eventId={eventId} onAddToLibraryManager={() => {}} />
      <div className={styles.headingContainer}>
        <HeadingLevelTwo margin="24px 0">EventLink</HeadingLevelTwo>
        <Button
          onClick={onToggleSectionCollapse}
          variant="text"
          color="secondary"
          label={isSectionsExpand ? 'Collapse All' : 'Expand All'}
        />
      </div>
      <ul className={styles.libraryList}>
        <Messaging
          isSectionExpand={isSectionsExpand}
          data={messages}
          messagesAreLoading={messagesAreLoading}
          deleteMessages={deleteMessages}
          refreshMessage={refreshMessage}
          getResponses={getResponses}
          updateMessage={updateMessage}
          responses={responses}
          divisions={divisions}
          pools={pools}
          teams={teams}
        />
        <ScheduleReview isSectionExpand={isSectionsExpand} />
      </ul>
    </section>
  );
};

const mapStateToProps = (state: {
  eventLink: {
    messages: IMessage[];
    messagesAreLoading: boolean;
    responses: IResponse[];
    data: {
      divisions: IDivision[];
      pools: IPool[];
      teams: ITeam[];
    };
  };
}) => {
  return {
    messages: state.eventLink.messages,
    messagesAreLoading: state.eventLink.messagesAreLoading,
    responses: state.eventLink.responses,
    divisions: state.eventLink.data.divisions,
    pools: state.eventLink.data.pools,
    teams: state.eventLink.data.teams,
  };
};

const mapDispatchToProps = {
  getData,
  getMessages,
  deleteMessages,
  refreshMessage,
  getResponses,
  updateMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(EventLink);
