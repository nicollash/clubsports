import React from 'react';
import {
  Modal,
  HeadingLevelTwo,
  Select,
  Input,
  Button,
  DeletePopupConfrim,
  ColorPicker,
} from 'components/common';
import { getIcon } from 'helpers';
import { BindingAction, IPool, BindingCbWithOne } from 'common/models';
import { ButtonVariant, ButtonColors, IPoolFields, Icons } from 'common/enums';
import { IInputEvent } from 'common/types';
import { getPoolOptions } from './helpers';
import styles from './styles.module.scss';

const DELETE_ICON_STYLES = {
  marginRight: '5px',
};

const DELETE_POPUP_MESSAGE =
  'To confirm that you want to delete this pool, please confirm by re-typing its name.';

interface Props {
  pools: IPool[];
  isOpen: boolean;
  onClose: BindingAction;
  onEdit: BindingCbWithOne<IPool>;
  onDelete: BindingCbWithOne<IPool>;
}

const PopupEditPool = ({ pools, isOpen, onClose, onEdit, onDelete }: Props) => {
  const [activePool, changeActivePool] = React.useState<IPool | null>(null);
  const [isDeletePool, toggleDeletePool] = React.useState<boolean>(false);

  React.useEffect(() => {
    return () => {
      changeActivePool(null);
      toggleDeletePool(false);
    };
  }, [isOpen]);

  const onChangeActivePool = ({ target: { value } }: IInputEvent) => {
    const poolById = pools.find(it => it.pool_id === value) as IPool;

    changeActivePool(poolById);
  };

  const onChangePool = ({ target: { value, name } }: IInputEvent) => {
    changeActivePool({ ...activePool, [name]: value } as IPool);
  };

  const onColorChange = (value: string) => {
    changeActivePool({
      ...activePool,
      pool_hex: value.replace(/#/, () => ""),
    } as IPool);
  };

  const onDeletePopup = () => {
    toggleDeletePool(true);
  };

  const onSave = () => {
    if (activePool) {
      onEdit(activePool);

      onClose();
    }
  };

  const onDeleteClick = () => {
    if (activePool) {
      onDelete(activePool);

      onClose();
    }
  };

  const options = getPoolOptions(pools);

  return isDeletePool ? (
    <DeletePopupConfrim
      type="pool"
      deleteTitle={activePool?.pool_name || ''}
      message={DELETE_POPUP_MESSAGE}
      isOpen={isDeletePool}
      onClose={onClose}
      onDeleteClick={onDeleteClick}
    />
  ) : (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Edit Pool</HeadingLevelTwo>
        </div>
        <div className={styles.selectWrapper}>
          <Select
            onChange={onChangeActivePool}
            value={activePool?.pool_id || ''}
            options={options}
            label="Select pool"
          />
        </div>
        <fieldset className={styles.inputsWrapper}>
          <legend className="visually-hidden">Pool information</legend>
          <ul className={styles.inputsList}>
            <li>
              <Input
                onChange={onChangePool}
                value={activePool?.pool_name || ''}
                name={IPoolFields.POOL_NAME}
                disabled={!activePool}
                label="Name"
              />
            </li>
            <li>
              <div className={styles.sectionItemColorPicker}>
                <p className={styles.sectionLabel}>
                  <span>Color</span>
                </p>
                <ColorPicker
                  label="Color"
                  width="221px"
                  value={
                    activePool
                      ? activePool.pool_hex
                        ? activePool.pool_hex
                        : "1c315f"
                      : "1c315f"
                  }
                  onChange={onColorChange}
                />
              </div>
            </li>
          </ul>
        </fieldset>
        <div className={styles.btnsWrapper}>
          <span className={styles.btnDeleteWrapper}>
            <Button
              onClick={onDeletePopup}
              disabled={!activePool}
              icon={getIcon(Icons.DELETE, DELETE_ICON_STYLES)}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.INHERIT}
              label="Delete Pool"
            />
          </span>
          <p>
            <Button
              onClick={onClose}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Cancel"
            />
            <span className={styles.btnWrapper}>
              <Button
                onClick={onSave}
                disabled={!activePool}
                variant={ButtonVariant.CONTAINED}
                color={ButtonColors.PRIMARY}
                label="Save"
              />
            </span>
          </p>
        </div>
      </section>
    </Modal>
  );
};

export default PopupEditPool;
