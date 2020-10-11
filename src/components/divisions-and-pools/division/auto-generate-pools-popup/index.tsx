﻿import React, { useState, useEffect } from "react";
import { Modal, HeadingLevelTwo, Select, Button } from "components/common";
import {
  BindingAction,
  IDivision,
  BindingCbWithFour,
  IPool,
} from "common/models";
import { ButtonVariant, ButtonColors } from "common/enums";
import { IInputEvent } from "common/types";
import styles from "../popup-pool-edit/styles.module.scss";
import { optionsAutogeneratePoools, namesMatching } from "./consts";
import WarnPopupOnGeneratePools from "./popup-warn-generate-pools";
import { getNumList, getDivisionsOptions } from "./helper";
import MultiSelect, { IMultiSelectOption } from "components/common/multi-select";

interface Props {
  pools: IPool[];
  divisions: IDivision[];
  isOpen: boolean;
  onClose: BindingAction;
  onEdit: BindingCbWithFour<IDivision[], number, string[], boolean>;
}

const AutogeneratePoolsPopup = ({
  pools,
  divisions,
  isOpen,
  onClose,
  onEdit,
}: Props) => {
  const [option, setOption] = useState(optionsAutogeneratePoools[0]);
  const [activeDivisions, changeActiveDivision] = useState<IDivision[]>();
  const [count, setCount] = useState<string>("1");
  const [isOpenWarning, setOpenWarning] = useState<boolean>(false);
  const [optionsForDivisions, setOptionsForDivisions] = useState<
    IMultiSelectOption[]
  >();

  useEffect(() => {
    const divisionsOptions = getDivisionsOptions(divisions);
    setOptionsForDivisions(divisionsOptions);
  }, [divisions]);

  useEffect(() => {
    return () => {
      setOption(optionsAutogeneratePoools[0]);
      setCount("1");
    };
  }, [isOpen]);

  const onChangeOption = ({ target: { value } }: IInputEvent) => {
    const selectedValue = optionsAutogeneratePoools.find(
      (it) => it.value === value
    );

    setOption(selectedValue ? selectedValue : optionsAutogeneratePoools[0]);
  };

  const onChangeDivision = (name: string, options: IMultiSelectOption[]) => {
    const selectedValue = divisions.filter((it: IDivision) =>
      options.filter((op) => op.checked).map((op) => op.value).includes(it.division_id)
    );
    if (!selectedValue && name) {
      return;
    }

    changeActiveDivision(selectedValue);
  };

  const onSave = (isDelete: boolean) => {
    setOpenWarning(false);
    if (!activeDivisions) {
      return;
    }
    const selectedNaming = namesMatching.find(
      (it) => it.option === option.value
    );
    onEdit(activeDivisions, Number(count), selectedNaming!.names, isDelete);
    onClose();
  }

  const onDeleteAllPools = () => onSave(true);
 
  const onAddToExisting = () => onSave(false);

  const onCloseWarning = () => setOpenWarning(false);

  const onSetCount = ({ target: { value } }: IInputEvent) => setCount(value);

  const checkPools = () => {
    const isWithPools = pools.find((it: IPool) =>
      activeDivisions?.map((op) => op.division_id).includes(it.division_id)
    );
    isWithPools ? setOpenWarning(true) : onAddToExisting();
  }

  const numList = getNumList();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <section className={styles.section}>
          <div className={styles.titleWrapper}>
            <HeadingLevelTwo>Auto-Generate Pools</HeadingLevelTwo>
          </div>
          <div className={styles.selectWrapper}>
            <Select
              onChange={onChangeOption}
              value={option.label}
              label="Select naming convention:"
              options={optionsAutogeneratePoools}
            />
          </div>
          <fieldset className={styles.inputsWrapper}>
            <ul className={styles.inputsList}>
              <li>
                {optionsForDivisions && (
                  <MultiSelect
                    name="divisions"
                    label="List of Divisions:"
                    selectOptions={optionsForDivisions}
                    onChange={onChangeDivision}
                  />
                )}
              </li>
              <li>
                <div className={styles.sectionItemColorPicker}>
                  <Select
                    onChange={onSetCount}
                    value={count || ''}
                    label="Number of Pools:"
                    options={numList}
                  />
                </div>
              </li>
            </ul>
          </fieldset>
          <div className={styles.btnsWrapper}>
            <Button
              onClick={onClose}
              variant={ButtonVariant.TEXT}
              color={ButtonColors.SECONDARY}
              label="Cancel"
            />
            <span className={styles.btnWrapper}>
              <Button
                onClick={checkPools}
                disabled={!activeDivisions}
                variant={ButtonVariant.CONTAINED}
                color={ButtonColors.PRIMARY}
                label="Save"
              />
            </span>
          </div>
        </section>
      </Modal>
      {isOpenWarning && activeDivisions && (
        <WarnPopupOnGeneratePools
          divisions={activeDivisions}
          isOpen={isOpenWarning}
          onClose={onCloseWarning}
          onDeleteAllPools={onDeleteAllPools}
          onAddToExisting={onAddToExisting}
        />
      )}
    </>
  );
};

export default AutogeneratePoolsPopup;