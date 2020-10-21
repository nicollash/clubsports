import React, { useEffect, useRef, useState } from 'react';
import { SectionDropdown, Button, DataGrid, MenuButton, Loader } from 'components/common';
import DeleteIcon from '@material-ui/icons/Delete';
import styles from '../../styles.module.scss';
import moment from 'moment';
import { BindingCbWithOne, IDivision, IPool, ITeam } from 'common/models';
import { IResponse } from 'components/event-link';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';
import { columnsForMessages } from "components/reports/data-sources/registrants/fields";
import { IMessage } from "common/models/event-link";
import { IRecipientDetails } from "components/event-link/create-message";
import CachedIcon from '@material-ui/icons/Cached';
import {
  getListOfNames,
  getRecipient,
  MessageType,
  Recipient,
  Type,
} from "components/event-link/helpers";
import { dateComparator } from "components/common/data-grid";
import DateRangeFilter from "components/common/data-grid/filters/DateRangeFilter";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";

enum MessageStatus {
  NEW = 'new',
  SENT = 'sent',
  SENDING = 'sending',
  SCHEDULED = 'scheduled',
  PREPARING = 'preparing',
  REPLIED = 'replied',
  ERROR = 'error',
};

interface IProps {
  divisions: IDivision[];
  pools: IPool[];
  teams: ITeam[];
  isSectionExpand: boolean;
  message: IMessage;
  responses: IResponse[];
  deleteMessages: BindingCbWithOne<string>;
  refreshMessage: (messageId: string) => void;
  getResponses: (messageId: string) => void;
  updateMessage: (messageId: string) => void;
};

const MessageItem = ({
  divisions,
  pools,
  teams,
  isSectionExpand,
  message,
  responses,
  deleteMessages,
  refreshMessage,
  getResponses,
  updateMessage,
}: IProps) => {
  const [isDeleteModalOpen, toggleDeleteModal] = useState<boolean>(false);
  const [recipientDetails, setRecipientDetails] = useState<IRecipientDetails>();

  const [isRefreshLoading, setIsRefreshLoading] = useState<boolean>(false);
  const [gridApi, setGridApi] = useState<GridApi>();
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi>();
  const [dateFilterOpen, setDateFilterOpen] = useState<boolean>(false);
  const [range, setRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection',
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(
    message.status === MessageStatus.SENDING ||
      message.status === MessageStatus.PREPARING ||
      message.status === MessageStatus.NEW
  );

  useEffect(() => {
    setIsRefreshLoading(false);
  }, [responses]);

  useEffect(() => {
    setRecipientDetails(JSON.parse(message.recipient_details));
  }, [message]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    const status =
      message.status === MessageStatus.SENDING ||
      message.status === MessageStatus.PREPARING ||
      message.status === MessageStatus.NEW;
    setIsLoadingStatus(status);
    if (!status) {
      getResponses(message.message_id);
    } else {
      timerId = setInterval(() => updateMessage(message.message_id), 5000);
    }
    return () => clearInterval(timerId);
  }, [message]);

  const dateRangeRef = useRef();

  const toggleDateFilter = () => {
    setDateFilterOpen((oldDateFilterOpen) => !oldDateFilterOpen);
  };

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  };

  let dateRangeString = 'All';
  const { startDate, endDate } = range;
  if (startDate || endDate) {
    if (dateComparator(startDate, endDate) === 0) {
      dateRangeString = moment(startDate!).format('MM/DD/YYYY');
    } else {
      dateRangeString = `${
        startDate ? moment(startDate!).format('MM/DD/YYYY') : ''
      } - ${endDate ? moment(endDate!).format('MM/DD/YYYY') : ''}`;
    }
  }

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

  const invokeFilterMethod = (callback: (reactFilterInstance: any) => void) => {
    gridApi?.getFilterInstance('receivedDatetime', agGridFilterInstance => {
      const reactFilterInstance = agGridFilterInstance.getFrameworkComponentInstance!();
      callback(reactFilterInstance);
    });
  };

  const syncGridFilterToState = () => {
    invokeFilterMethod(filter => setRange(filter.getModel()));
  };

  const onDateFilterButtonClick = () => {
    syncGridFilterToState();
    toggleDateFilter();
  };

  const filterChangedCallback = () => {
    invokeFilterMethod(filter => {
      const dateRange = dateRangeRef.current;
      const filterRange = (dateRange as any).getModel();
      filter.setModel(filterRange);
      setRange(filterRange);
    });
  };

  const onRefreshClick = () => {
    setIsRefreshLoading(true);
    refreshMessage(message.message_id);
  };

  const deleteMessage = `You are about to delete this message and this cannot be undone.
  Please, enter the title of the message to confirm.`;

  return (
    <li>
      <SectionDropdown expanded={isSectionExpand} panelDetailsType="flat">
        <div className={styles.msTitleContainer}>
          <p className={styles.msTitle}>
            {message.message_title}
            {responses?.length !== 0 ? `(${responses.length})` : null}
          </p>
          <p className={styles.msDeliveryDate}>
            {new Date(message.send_datetime) < new Date()
              ? `Sent ${moment(message.send_datetime).format("MMM D, hh:mm A")}`
              : `Will be sent ${moment(message.send_datetime).format(
                  'MMM D, hh:mm A'
                )}`}
          </p>
        </div>
        <div className={styles.msContent}>
          <div>
            <div className={styles.msContentMessage}>
              <div>
                <span className={styles.msContentTitle}>Message:</span>{' '}
                {message.message_type === Type.TEXT
                  ? message.message_body
                  : message.message_type}
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
                <div>
                  {isRefreshLoading ? (
                    <Loader size={20} styles={{ backgroudColor: '#00A3EA', margin: '0 10px' }}/>
                  ) : (
                    <Button
                      label="Refresh"
                      icon={<CachedIcon />}
                      variant="text"
                      color="secondary"
                      onClick={onRefreshClick}
                    />
                  )}
                </div>
                <MenuButton
                  label='Export'
                  variant='text'
                  color='secondary'
                  menuItems={[
                    {
                      label: "... to CSV",
                      action: () => gridApi?.exportDataAsCsv(),
                    },
                    {
                      label: "... to Excel",
                      action: () => gridApi?.exportDataAsExcel(),
                    },
                  ]}
                />
              </div>
            </div>
            <div className={styles.msInfoWrapper}>
              <div className={styles.msInfoContent}>
                <p>
                <span className={styles.msContentTitle}>Status:{' '}</span>
                  {message.status?.toLocaleUpperCase()}
                  {(message.status === MessageStatus.SENDING ||
                    message.status === MessageStatus.PREPARING ||
                    message.status === MessageStatus.NEW) && (
                    <Loader size={10} styles={{width: '24px', padding: 0}}/>
                  )}
                </p>
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
                          <span className={styles.msContentTitle}>Divisions of participants:{" "}</span>
                          {getListOfNames(
                            recipientDetails.divisionIds,
                            divisions,
                            "short_name",
                            "division_id"
                          )}
                        </p>
                      )}
                      {recipientDetails.poolIds?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Pools of participants:</span>{" "}
                          {getListOfNames(
                            recipientDetails.poolIds,
                            pools,
                            "pool_name",
                            "pool_id"
                          )}
                        </p>
                      )}
                      {recipientDetails.teamIds?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>Teams of participants:</span>{" "}
                          {getListOfNames(
                            recipientDetails.teamIds,
                            teams,
                            "short_name",
                            "team_id"
                          )}
                        </p>
                      )}
                      {recipientDetails.groups?.length !== 0 && (
                        <p>
                          <span className={styles.msContentTitle}>
                            Groups of participants:
                          </span>{" "}
                          {recipientDetails.groups.join(', ')}
                        </p>
                      )}
                    </>
                  )}
                <p>
                  <span className={styles.msContentTitle}>Type:</span>{' '}
                  {message.message_type},{" "}
                  {message.one_way_two_way === 1
                    ? MessageType.ONE_WAY
                    : MessageType.TWO_WAY}
                </p>
              </div>
              <div>
                <Button
                  label={`Response Dates: ${dateRangeString}`}
                  color='secondary'
                  variant='outlined'
                  onClick={onDateFilterButtonClick}
                />
                {!isLoadingStatus && dateFilterOpen && (
                  <div className={styles.dateFilter}>
                    <DateRangeFilter
                      ref={dateRangeRef}
                      column={gridColumnApi?.getColumn('receivedDatetime')}
                      comparator={dateComparator}
                      api={gridApi}
                      initialRange={range}
                      filterChangedCallback={filterChangedCallback}
                      closeFilter={toggleDateFilter}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isLoadingStatus && (
            <div className={styles.msContainer}>
              <DataGrid
                columns={columnsForMessages}
                rows={responses}
                defaultToolPanel={''}
                height={40}
                onGridReady={onGridReady}
              />
            </div>
          )}
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
