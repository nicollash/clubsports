import React, { useState } from 'react';
import styles from '../styles.module.scss';
import { getIcon } from 'helpers/get-icon.helper';
import { Icons } from 'common/enums/icons';
import { Button } from 'components/common';
import { IMapping } from 'common/models/table-columns';
import { BindingCbWithOne } from 'common/models';
import DeletePopupConfrim from 'components/common/delete-popup-confirm';

const DELETE_ICON_STYLES = {
  width: '21px',
  margin: '0',
  fill: '#ff0f19',
};

interface Props {
  map: IMapping;
  onMappingDelete: BindingCbWithOne<number>;
}

const Mapping = ({ map, onMappingDelete }: Props) => {
  const [isDeleteModalOpen, toggleDeleteModal] = useState(false);
  const deleteMessage = `You are about to delete this mapping and this cannot be undone.
  Please, enter the name of the mapping to continue.`;

  return (
    <tr key={map.member_map_id}>
      <td className={styles.mappingName}>{map.import_description}</td>
      <td>
        <Button
          onClick={() => toggleDeleteModal(true)}
          icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
          label={<span className="visually-hidden">Delete mapping</span>}
          variant="text"
          color="inherit"
          type="dangerLink"
        />
      </td>
      <DeletePopupConfrim
        type={'mapping'}
        deleteTitle={map.import_description}
        message={deleteMessage}
        isOpen={isDeleteModalOpen}
        onClose={() => toggleDeleteModal(false)}
        onDeleteClick={() => onMappingDelete(map.member_map_id)}
      />
    </tr>
  );
};

export default Mapping;
