import React from 'react';
import styles from './styles.module.scss';
import { Button, HeadingLevelFour, ZoomControls } from 'components/common';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ITimeSlot from 'common/models/schedule/timeSlots';
import { IField, IFacility, IPinchProps } from 'common/models';
import { IField as IScheduleField } from 'common/models/schedule/fields';
import { formatTimeSlot } from 'helpers';
import { mapFieldsData } from 'components/schedules/mapTournamentData';
import { sortFieldsByPremier } from 'components/common/matrix-table/helper';

const TRANSFORM_WRAPPER_OPTIONS = {
  minScale: 0.2,
  limitToWrapper: false,
  centerContent: true,
  limitToBounds: false,
};

interface IProps {
  timeSlots: ITimeSlot[];
  fields: IField[];
  facilities: IFacility[];
  onClose: () => void;
}

const ViewMatrix = (props: IProps) => {
  const { onClose, timeSlots, fields, facilities } = props;

  const mappedFields = mapFieldsData(fields, facilities);
  const sortedFields = sortFieldsByPremier(mappedFields);

  const renderGameSlot = () => (
    <td className={styles.gameSlot} key={Math.random()}>
      <div />
      <div />
    </td>
  );

  const renderField = (field: IScheduleField) => (
    <th key={Math.random()}>
      {field.name} ({field.facilityName})
    </th>
  );

  const renderTimeSlot = (time: string) => (
    <tr key={Math.random()}>
      <th>{formatTimeSlot(time)}</th>
      {sortedFields.map(() => renderGameSlot())}
    </tr>
  );

  return (
    <div className={styles.container}>
      <HeadingLevelFour>
        <>Schedule Matrix</>
      </HeadingLevelFour>
      <div className={styles.tableWrapper}>
        <TransformWrapper
          defaultScale={0.3}
          defaultPositionY={20}
          options={{ ...TRANSFORM_WRAPPER_OPTIONS, disabled: false }}
          wheel={{ step: 10 }}
        >
          {({ zoomIn, zoomOut }: IPinchProps) => (
            <>
              <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />
              <TransformComponent>
                <table>
                  <tbody>
                    <tr>
                      <td />
                      {sortedFields.map(item => renderField(item))}
                    </tr>
                    {timeSlots.map(item => renderTimeSlot(item.time))}
                  </tbody>
                </table>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
      <div className={styles.btnsWrapper}>
        <Button
          label="Close"
          variant="contained"
          color="primary"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default ViewMatrix;
