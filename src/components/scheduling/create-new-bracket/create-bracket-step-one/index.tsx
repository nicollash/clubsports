import React from 'react';
import {
    Radio,
} from '../../../common';

import styles from '../styles.module.scss';
import { BindingCbWithOne } from 'common/models';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

interface ICreateBracketStepOne {
    modeOptions: string[];
    modeChange: BindingCbWithOne<InputTargetValue>;
    mode: number;
};

const CreateBracketStepOne = ({
    modeOptions,
    modeChange,
    mode,
    }: ICreateBracketStepOne) => {
        
    const onChangeMode = (e: InputTargetValue) => {
        modeChange(e);
    };
    return (
        <div>
            <p className={styles.message}>
                Do you want to use our Bracket Scheduling Algorithm or create your own custom brackets?
            </p>
            <div className={styles.radioBtnsWrapper}>
                <Radio
                options={modeOptions}
                formLabel=""
                onChange={onChangeMode}
                checked={modeOptions[mode] || ''}
                />
            </div>
        </div>
     );
}

  export default CreateBracketStepOne;