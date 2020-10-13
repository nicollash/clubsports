import React, { useState } from 'react';
import { SectionDropdown, Button, Loader } from 'components/common';
import { MenuTitles } from 'common/enums';
import MessageItem from './message-item';
import styles from '../styles.module.scss';
import { BindingCbWithOne, IDivision, IPool, ITeam } from 'common/models';
import { IResponse } from '..';
import { IMessage } from "common/models/event-link";

interface Props {
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  isSectionExpand: boolean;
  data: IMessage[];
  messagesAreLoading: boolean;
  responses: IResponse[];
  deleteMessages: BindingCbWithOne<string>;
}
const Messaging = ({
  divisions,
  pools,
  teams,
  isSectionExpand,
  data,
  responses,
  messagesAreLoading,
  deleteMessages,
}: Props) => {
  const [areMessagesExpand, toggleMessagesExpand] = useState<boolean>(true);
  const [currentMessages, setCurrentMessages] = useState<number>(3);

  const onToggleMessagesCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMessagesExpand(!areMessagesExpand);
  };

  const onLoadMoreClick = () => {
    setCurrentMessages(currentMessages + 3);
  };

  return (
    <li>
      <SectionDropdown
        id={MenuTitles.MESSAGING}
        type="section"
        panelDetailsType="flat"
        expanded={isSectionExpand}
      >
        <div className={styles.msHeadingContainer}>
          Messaging
          <Button
            onClick={onToggleMessagesCollapse}
            variant="text"
            color="secondary"
            label={areMessagesExpand ? 'Collapse All' : 'Expand All'}
          />
        </div>
        <div className={styles.msContainer}>
          <ul className={styles.msMessageList}>
            {messagesAreLoading && <Loader />}
            {!messagesAreLoading && data.length
              ? data
                  .slice(0, currentMessages)
                  .map((message, index: number) => (
                    <MessageItem
                      key={index}
                      isSectionExpand={areMessagesExpand}
                      message={message}
                      divisions={divisions}
                      pools={pools}
                      teams={teams}
                      deleteMessages={deleteMessages}
                      responses={responses.filter(
                        (resp) => resp.messageId === message.message_id
                      )}
                    />
                  ))
              : !messagesAreLoading && (
                  <div className={styles.noFoundWrapper}>
                    <span>There are no messages yet.</span>
                  </div>
                )}
          </ul>
          {!messagesAreLoading && data.length > currentMessages && (
            <div className={styles.msLoadeMoreBtnWrapper}>
              <Button
                onClick={onLoadMoreClick}
                variant="text"
                color="secondary"
                label="Load More Messages"
              />
            </div>
          )}
        </div>
      </SectionDropdown>
    </li>
  );
};

export default Messaging;
