import React, { useState } from 'react';
import { IRegistration } from 'common/models/registration';
import { BindingCbWithTwo } from 'common/models';
import styles from './styles.module.scss';
import CustomReactQuill from "components/common/react-quill";

interface IWaiverProps {
  data: IRegistration | undefined;
  isEdit: boolean;
  onChange?: BindingCbWithTwo<string, string | number>;
}

const Waiver = ({ data, isEdit, onChange }: IWaiverProps) => {
  const [model, setModel] = useState(data?.waiver_content);

  const onModelChange = (text: string) => {
    setModel(text);
    onChange!('waiver_content', text);
  };

  const renderWaiver = () => {
    if (!data) {
      return;
    }
    if (isEdit && onChange) {
      return <CustomReactQuill data={model} onChange={onModelChange} />;
    }
    if (data.waiver_content === null) {
      return <div>No waivers currently exist. Create your first one using the above Edit.</div>;
    }
    return (
      <div className={`${styles.waiverWrapp} ql-snow ql-editor`}>
        <div dangerouslySetInnerHTML={{ __html: data.waiver_content }} />
      </div>
    );
  };

  return <div>{renderWaiver()}</div>;
};

export default Waiver;
