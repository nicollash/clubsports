import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { loadRegistrantData } from 'components/register-page/individuals/player-stats/logic/actions';
import {
  updateRequestedIds,
  swapRequestedIds,
  updateOptions,
  loadCustomData,
} from 'components/registration/registration-edit/logic/actions';

import DefaultGroup from './defaultGroup';
import RequestGroup from './requestGroup';
import { BindingCbWithOne } from 'common/models';
import styles from './styles.module.scss';

interface IDataRequest {
  requestedIds: any;
  eventId: string;
  options: any;
  registrantDataFields: any;
  loadRegistrantData: () => void;
  updateRequestedIds: BindingCbWithOne<any>;
  swapRequestedIds: BindingCbWithOne<any>;
  updateOptions: BindingCbWithOne<any>;
  editField: BindingCbWithOne<any>;
  onAddNewField: () => void;
  loadCustomData: BindingCbWithOne<string>;
}

const DataRequest = ({
  requestedIds,
  eventId,
  options,
  registrantDataFields,
  loadRegistrantData,
  loadCustomData,
  updateRequestedIds,
  swapRequestedIds,
  updateOptions,
  onAddNewField,
  editField,
}: IDataRequest) => {
  useEffect(() => {
    loadRegistrantData();
    loadCustomData(eventId);
  }, [loadRegistrantData, loadCustomData, eventId]);

  const getRequestFields = () =>
    registrantDataFields.filter((el: any) =>
      requestedIds.every((id: number | string) => id !== el.data_field_id)
    );

  const getDefaultFields = () => {
    const sortedFields = requestedIds
      .map((id: number) => {
        const filteredList = registrantDataFields.filter(
          (field: any) => field.data_field_id === id
        );
        if (filteredList.length > 0) {
          return filteredList[0];
        }
        return true;
      })
      .filter((el: any) => el);

    return sortedFields;
  };

  return (
    <div className={styles.fieldGroupContainer}>
      <DndProvider backend={HTML5Backend}>
        <DefaultGroup
          fields={getRequestFields()}
          updateRequestedIds={updateRequestedIds}
          onAddNewField={onAddNewField}
          editField={editField}
          updateOptions={updateOptions}
        />
        <RequestGroup
          requestedIds={requestedIds}
          fields={getDefaultFields()}
          options={options}
          updateRequestedIds={updateRequestedIds}
          swapRequestedIds={swapRequestedIds}
          updateOptions={updateOptions}
        />
      </DndProvider>
    </div>
  );
};

const mapStateToProps = (state: {
  registration: { requestedIds: any; options: any };
}) => ({
  requestedIds: state.registration.requestedIds,
  options: state.registration.options,
});

const mapDispatchToProps = {
  loadRegistrantData,
  updateRequestedIds,
  swapRequestedIds,
  updateOptions,
  loadCustomData,
};

export default connect(mapStateToProps, mapDispatchToProps)(DataRequest);
