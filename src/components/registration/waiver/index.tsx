import React, { useState } from 'react';
import { IRegistration } from 'common/models/registration';
import { BindingCbWithTwo } from 'common/models';
import styles from './styles.module.scss';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';

interface IWaiverProps {
  data: IRegistration | undefined;
  isEdit: boolean;
  onChange?: BindingCbWithTwo<string, string | number>;
}

const Waiver = ({ data, isEdit, onChange }: IWaiverProps) => {
  const [model, setModel] = useState(data?.waiver_content);

  const quill = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  const onModelChange = (text: string) => {
    setModel(text);
    onChange!('waiver_content', text);
  };

  const renderWaiver = () => {
    if (!data) {
      return;
    }
    if (isEdit && onChange) {
      return (
        <div className={styles.redactorWrapp}>
          <ReactQuill
            className={styles.redactor}
            theme={'snow'}
            value={model || ''}
            modules={quill}
            formats={formats}
            placeholder={'Write something...'}
            onChange={onModelChange}
          />
        </div>
      );
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
