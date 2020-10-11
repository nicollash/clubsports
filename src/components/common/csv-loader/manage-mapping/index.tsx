import React from 'react';
import Modal from 'components/common/modal';
import styles from './styles.module.scss';
import { BindingAction, BindingCbWithOne } from 'common/models';
import { IMapping } from 'common/models/table-columns';
import Mapping from './mapping-item';

interface IProps {
  isOpen: boolean;
  onClose: BindingAction;
  mappings: IMapping[];
  onMappingDelete: BindingCbWithOne<number>;
}

const ManageMapping = ({
  isOpen,
  onClose,
  mappings,
  onMappingDelete,
}: IProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container} style={{ overflowY: 'auto' }}>
        <div className={styles.sectionTitle}>Manage Historical Mappings</div>
        <table className={styles.mappingsTable}>
          <thead>
            <tr>
              <th className={styles.mappingName}>Name</th>
              <th className={styles.mappingActions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map(map => (
              <Mapping
                map={map}
                key={map.member_map_id}
                onMappingDelete={onMappingDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default ManageMapping;
