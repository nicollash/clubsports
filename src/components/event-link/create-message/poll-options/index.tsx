import React from 'react';
import styles from '../styles.module.scss';
import { IPollOption } from "..";
import { Button, Checkbox, Input } from "components/common";
import { ButtonColors, ButtonTypes, ButtonVariant } from "common/enums";
import { IInputEvent } from "common/types";

interface IProps {
  options: IPollOption[];
  onChangeValue: (value: IPollOption[]) => void;
  onAddAdditionalOption: () => void;
}

const PollOptions = ({
  options,
  onChangeValue,
  onAddAdditionalOption,
}: IProps) => {

  const onChange = (id: string, field: string, value: string | number) => {
    const currentOptions = options.map((opt: IPollOption) => {
      return opt.id === id
        ? {
            ...opt,
            [field]: value,
          }
        : opt;
    });
    onChangeValue(currentOptions);
  };

  const onDelete = (id: string) => {
    const currentOptions = options.filter((opt: IPollOption) => opt.id !== id);
    onChangeValue(currentOptions);
  };

  return (
    <div className={styles.polls}>
      <div className={styles.pollsWrapper}>
        <div className={styles.label}>Response Options</div>
        <div className={styles.label}>Associated Values</div>
        <div className={styles.labelResp}>Your reply if this response</div>
      </div>
      {options.map((opt: IPollOption) => (
        <div key={opt.id} className={styles.pollsWrapper}>
          <Input
            fullWidth={true}
            onChange={(e: IInputEvent) =>
              onChange(opt.id, "answerText", e.target.value)
            }
            value={opt.answerText}
          />
          <Input
            fullWidth={true}
            onChange={(e: IInputEvent) =>
              onChange(opt.id, "answerCode", e.target.value)
            }
            value={opt.answerCode}
          />
          <div className={styles.response}>
            <Checkbox
              options={[
                {
                  label: '',
                  checked: Boolean(opt.hasResponse),
                },
              ]}
              onChange={(e: IInputEvent) =>
                onChange(
                  opt.id,
                  "hasResponse",
                  e.target.checked ? 1 : 0
                )
              }
            />
            <Input
              fullWidth={true}
              onChange={(e: IInputEvent) =>
                onChange(opt.id, "responseMessage", e.target.value)
              }
              value={opt.responseMessage}
              disabled={!Boolean(opt.hasResponse)}
            />
            <div className={styles.deleteBttn}>
              <Button
                onClick={() => onDelete(opt.id)}
                variant={ButtonVariant.OUTLINED}
                color={ButtonColors.INHERIT}
                type={ButtonTypes.DANGER_LINK}
                label="Delete"
              />
            </div>
          </div>
        </div>
      ))}
      <div className={styles.btnsWrapp}>
        <Button
          onClick={onAddAdditionalOption}
          variant={ButtonVariant.OUTLINED}
          color={ButtonColors.PRIMARY}
          label="+ Add Additional"
        />
      </div>
    </div>
  );
};

export default PollOptions;
