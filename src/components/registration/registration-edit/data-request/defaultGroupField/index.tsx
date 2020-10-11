import React from 'react';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { BindingCbWithOne } from 'common/models';
import { DndItems } from '../types';
import moveIcon from 'assets/moveIcon.png';
import EditIcon from '@material-ui/icons/Edit';
import styles from '../styles.module.scss';

interface IDefaultGroupField {
  data: any;
  updateRequestedIds: BindingCbWithOne<any>;
  updateOptions: BindingCbWithOne<any>;
  editField: BindingCbWithOne<any>;
}

const DefaultGroupField = ({
  data,
  updateRequestedIds,
  updateOptions,
  editField,
}: IDefaultGroupField) => {
  const [, drag] = useDrag({
    item: { type: DndItems.REGISTRANT_DATA_FIELD },
    end(_, monitor: DragSourceMonitor) {
      const dropResult = monitor.getDropResult();

      if (!dropResult) {
        return;
      }

      const { name } = dropResult;
      if (name === 'requestGroup') {
        updateRequestedIds({
          id: data.data_field_id,
          status: 'add',
        });
        updateOptions({
          id: data.data_field_id,
          value: 0,
          status: 'add',
        });
      }
    },
  });

  const onClickEdit = () => {
    editField(data);
  };

  return (
    <div ref={drag} className={styles.fieldWrapper}>
      <div className={styles.field}>{data.data_label}</div>
      <div
        className={
          data.is_default_YN === null ? styles.editIconWrapper : styles.hidden
        }
      >
        <EditIcon onClick={onClickEdit} fontSize="small" />
      </div>
      <span className={styles.iconWrapper}>
        <img
          src={moveIcon}
          style={{
            width: '21px',
            height: '21px',
            alignSelf: 'center',
          }}
          alt=""
        />
      </span>
    </div>
  );
};

export default DefaultGroupField;
