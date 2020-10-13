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
  onDeleteOption: () => void;
}

const PollOptions = ({
  options,
  onChangeValue,
  onAddAdditionalOption,
  onDeleteOption,
}: IProps) => {

  const onChange = (ind: number, field: string, value: string | number) => {
    const currentOptions = options.map((opt: IPollOption) => {
      return opt.index === ind
        ? {
            ...opt,
            [field]: value,
          }
        : opt;
    });
    onChangeValue(currentOptions);
  };

  return (
    <div className={styles.polls}>
      <div className={styles.pollsWrapper}>
        <div className={styles.label}>Poll Options</div>
        <div className={styles.label}>Poll Values</div>
        <div className={styles.labelResp}>Responses</div>
      </div>
      {options.map((opt: IPollOption) => (
        <div key={opt.index} className={styles.pollsWrapper}>
          <Input
            key={opt.index}
            fullWidth={true}
            onChange={(e: IInputEvent) =>
              onChange(opt.index, "answerText", e.target.value)
            }
            value={opt.answerText}
          />
          <Input
            key={opt.index}
            fullWidth={true}
            onChange={(e: IInputEvent) =>
              onChange(opt.index, "answerCode", e.target.value)
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
                  opt.index,
                  "hasResponse",
                  e.target.checked ? 1 : 0
                )
              }
            />
            <Input
              fullWidth={true}
              onChange={(e: IInputEvent) =>
                onChange(opt.index, "responseMessage", e.target.value)
              }
              value={opt.responseMessage}
              disabled={!Boolean(opt.hasResponse)}
            />            
          </div>

        </div>
      ))}
      <div className={styles.btnsWrapp}>
        <Button
          onClick={onDeleteOption}
          variant={ButtonVariant.TEXT}
          color={ButtonColors.INHERIT}
          type={ButtonTypes.DANGER_LINK}
          label="Delete"
        />
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
