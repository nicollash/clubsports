import React from 'react';
import {
  Modal,
  HeadingLevelTwo,
  SelectMultiple,
  Button,
  Checkbox,
} from 'components/common';
import { BindingAction, BindingCbWithTwo } from 'common/models';
import { ButtonVariant, ButtonColors, EntryPoints } from 'common/enums';
import { IEntity, IInputEvent } from 'common/types';
import { getSelectOptions, getEntityByOptions } from './helpers';
import styles from './styles.module.scss';

const BUTTON_STYLES = {
  width: '115px',
};

interface Props {
  entities: IEntity[];
  entryPoint: EntryPoints;
  isOpen: boolean;
  onClose: BindingAction;
  addEntitiesToLibrary: BindingCbWithTwo<IEntity[], EntryPoints>;
}

const PopupAddToLibrary = ({
  entities,
  entryPoint,
  isOpen,
  onClose,
  addEntitiesToLibrary,
}: Props) => {
  const [isConfirm, toggleConfirm] = React.useState<boolean>(false);
  const [checkedValues, changeOptions] = React.useState<string[] | null>(null);
  const [isSelectedAll, toggleSelectAll] = React.useState<boolean>(false);

  React.useEffect(() => {
    toggleConfirm(false);

    changeOptions(null);

    toggleSelectAll(false);
  }, [isOpen]);

  const selectOptions = getSelectOptions(entities, entryPoint);

  const isAllowShare = entities.length > 0;

  const onChangeOption = (checkedValues: string[] | null) => {
    changeOptions(checkedValues as string[]);
  };

  const onToggleConfirm = () => toggleConfirm(!isConfirm);

  const onSave = () => {
    if (checkedValues) {
      const entitiesByOptions = getEntityByOptions(
        entities,
        checkedValues,
        entryPoint
      );

      addEntitiesToLibrary(entitiesByOptions!, entryPoint);

      onClose();
    }
  };

  const onToggleSelectAll = ({ target }: IInputEvent) => {
    if (target.checked) {
      changeOptions(selectOptions!.map(it => it.value) as string[]);

      toggleSelectAll(true);
    } else {
      changeOptions(null);

      toggleSelectAll(false);
    }
  };

  const checkboxOption = {
    label: 'Select all',
    checked: isSelectedAll,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.titleWrapper}>
          <HeadingLevelTwo>Save to Library:</HeadingLevelTwo>
        </div>
        <div className={styles.SelectWrapper}>
          {isAllowShare ? (
            isConfirm ? (
              <p className={styles.confirmText}>
                Are you sure you want to continue and add the item to the
                library?
              </p>
            ) : (
              <>
                <SelectMultiple
                  onChange={onChangeOption}
                  value={checkedValues || []}
                  options={selectOptions!}
                  label="Select item"
                  width="100%"
                />
                <div className={styles.checkobxWrapper}>
                  <Checkbox
                    onChange={onToggleSelectAll}
                    options={[checkboxOption]}
                  />
                </div>
              </>
            )
          ) : (
            <p>You don’t have items to share</p>
          )}
        </div>
        <p className={styles.btnsWrapper}>
          <span className={styles.btnWrapper}>
            <Button
              onClick={onClose}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              btnStyles={BUTTON_STYLES}
              label="Cancel"
            />
          </span>
          <span className={styles.btnWrapper}>
            {isAllowShare &&
              (isConfirm ? (
                <Button
                  onClick={onSave}
                  variant={ButtonVariant.CONTAINED}
                  color={ButtonColors.PRIMARY}
                  btnStyles={BUTTON_STYLES}
                  label="Save"
                />
              ) : (
                <Button
                  onClick={onToggleConfirm}
                  variant={ButtonVariant.CONTAINED}
                  color={ButtonColors.PRIMARY}
                  btnStyles={BUTTON_STYLES}
                  label="Save"
                />
              ))}
          </span>
        </p>
      </section>
    </Modal>
  );
};

export default PopupAddToLibrary;
