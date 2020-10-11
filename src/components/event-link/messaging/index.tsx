import React, { useState } from 'react';
import { SectionDropdown, Button, Loader } from 'components/common';
import { MenuTitles } from 'common/enums';
import MessageItem from './message-item';
import styles from '../styles.module.scss';
import { BindingCbWithOne } from 'common/models';
import { IGroupedMessages } from '..';

interface Props {
  isSectionExpand: boolean;
  data: IGroupedMessages[];
  messagesAreLoading: boolean;
  sendMessages: BindingCbWithOne<IGroupedMessages>;
  deleteMessages: BindingCbWithOne<string[]>;
}
const Messaging = ({
  isSectionExpand,
  data,
  messagesAreLoading,
  sendMessages,
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
                      sendMessages={sendMessages}
                      deleteMessages={deleteMessages}
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
