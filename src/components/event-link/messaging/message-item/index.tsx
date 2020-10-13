import React, { useEffect, useState } from 'react';
import { SectionDropdown, Button, DataGrid } from 'components/common';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from '../../styles.module.scss';
import { capitalize } from 'lodash';
import moment from 'moment';
import { BindingCbWithOne, IDivision, IPool, ITeam } from 'common/models';
import { IResponse } from 'components/event-link';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { columnsForMessages } from "components/reports/data-sources/registrants/fields";
import { IMessage } from "common/models/event-link";
import { IRecipientDetails } from "components/event-link/create-message";
import { getDivisions, getPools, getRecipient, getTeams, Recipient, Type } from "components/event-link/helpers";
interface IProps {
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  isSectionExpand: boolean;
  message: IMessage;
  responses: IResponse[];
  deleteMessages: BindingCbWithOne<string>;
}

const MessageItem = ({
  divisions,
  pools,
  teams,
  isSectionExpand,
  message,
  responses,
  deleteMessages,
}: IProps) => {
  const [isDeleteModalOpen, toggleDeleteModal] = useState<boolean>(false);
  const [recipientDetails, setRecipientDetails] = useState<IRecipientDetails>();

  useEffect(() => {
    setRecipientDetails(JSON.parse(message.recipient_details));
  }, [message]);

  const onMessagesDelete = () => {
    deleteMessages(message.message_id);
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
            {new Date(message.send_datetime) < new Date()
              ? `Sent ${moment(message.send_datetime).format("MMM d, hh:ss a")}`
              : `Will be sent ${moment(message.send_datetime).format(
                  'MMM d, hh:ss a'
                )}`}
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
                {recipientDetails &&
                  recipientDetails.recipient === Recipient.ONE && (
                    <p>
                      <span className={styles.msContentTitle}>
                        {message.message_type === Type.EMAIL
                          ? "Participant's Email:"
                          : "Participant's Phone number:"}
                      </span>{" "}
                      {getRecipient(recipientDetails, message.message_type)}
                    </p>
                  )}
                {recipientDetails &&
                  recipientDetails.recipient === Recipient.MANY && (
                    <>
                      {recipientDetails.divisionIds?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Divisions of participants:</span>{" "}
                          {getDivisions(recipientDetails.divisionIds, divisions)}
                        </p>
                      )}
                      {recipientDetails.poolIds?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Pools of participants:</span>{" "}
                          {getPools(recipientDetails.poolIds, pools)}
                        </p>
                      )}
                      {recipientDetails.teamIds?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Teams of participants:</span>{" "}
                          {getTeams(recipientDetails.teamIds, teams)}
                        </p>
                      )}
                      {recipientDetails.groups?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Groups of participants:</span>{" "}
                          {recipientDetails.groups.join(', ')}
                        </p>
                      )}
                    </>
                  )}
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
          <div className={styles.msContainer}>
            <DataGrid
              columns={columnsForMessages}
              rows={responses}
              defaultToolPanel={''}
              height={40}
            />
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
