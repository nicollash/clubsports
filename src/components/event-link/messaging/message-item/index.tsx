import React, { useState } from 'react';
import { SectionDropdown, Button } from 'components/common';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from '../../styles.module.scss';
// import { IMessage } from 'common/models/event-link';
import { capitalize } from 'lodash';
import moment from 'moment';
import { BindingCbWithOne } from 'common/models';
import { IGroupedMessages } from 'components/event-link';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { formatPhoneNumber } from 'helpers/formatPhoneNumber';

interface IProps {
  isSectionExpand: boolean;
  message: IGroupedMessages;
  sendMessages: BindingCbWithOne<IGroupedMessages>;
  deleteMessages: BindingCbWithOne<string[]>;
}

const MessageItem = ({
  isSectionExpand,
  message,
  sendMessages,
  deleteMessages,
}: IProps) => {
  const [isDeleteModalOpen, toggleDeleteModal] = useState<boolean>(false);
  const onMessageSend = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendMessages(message);
  };

  const onMessagesDelete = () => {
    deleteMessages(message.message_ids);
    toggleDeleteModal(false);
  };

  const onDeleteClick = () => {
    toggleDeleteModal(true);
  };

  const onDeleteModalClose = () => {
    toggleDeleteModal(false);
  };

  const deleteMessage = `You are about to delete this message and this cannot be undone.
  Please, enter the title of the message to continue.`;

  return (
    <li>
      <SectionDropdown expanded={isSectionExpand} panelDetailsType="flat">
        <div className={styles.msTitleContainer}>
          <p className={styles.msTitle}>
            {capitalize(message.message_title) || message.message_type}
          </p>
          <p className={styles.msDeliveryDate}>
            {message.status === 1 || message.sendDatetime ? (
              `Sent ${moment(message.sendDatetime).format('MM.DD.YYYY, HH:mm')}`
            ) : (
              <Button
                label="Send Now"
                color="secondary"
                variant="text"
                onClick={onMessageSend}
              />
            )}
          </p>
        </div>
        <div className={styles.msContent}>
          <div>
            <p className={styles.msContentMessage}>
              <span className={styles.msContentTitle}>Message:</span>{' '}
              {message.message_body || message.message_type}
            </p>
            <div className={styles.msInfoWrapper}>
              <div className={styles.msInfoContent}>
                <p>
                  <span className={styles.msContentTitle}>Recipients:</span>{' '}
                  {message.recipients.length === 1
                    ? formatPhoneNumber(message.recipients[0])
                    : message.recipients.length}
                </p>
                <p>
                  <span className={styles.msContentTitle}>Type:</span>{' '}
                  {message.message_type}
                </p>
              </div>
              <div>
                <Button
                  label="Delete"
                  variant="text"
                  color="secondary"
                  type="dangerLink"
                  icon={<DeleteIcon style={{ fill: '#FF0F19' }} />}
                  onClick={onDeleteClick}
                />
                <Button
                  label="+ Add to Library"
                  variant="text"
                  color="secondary"
                  onClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionDropdown>
      <DeletePopupConfrim
        type={'message'}
        deleteTitle={message.message_title}
        message={deleteMessage}
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onDeleteClick={onMessagesDelete}
      />
    </li>
  );
};

export default MessageItem;
