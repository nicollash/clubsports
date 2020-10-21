import React from 'react';
import styles from './styles.module.scss';
import 'react-quill/dist/quill.snow.css';
import ReactQuill, { Quill } from 'react-quill';

interface ICustomReactQuillProps {
  data: string | null | undefined;
  onChange: (model: string) => void;
  onHandleChangeSelection?: ((num: number | undefined) => void) | undefined;
}

const CustomReactQuill = ({ data, onChange, onHandleChangeSelection }: ICustomReactQuillProps) => {

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
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

  let quillRef: Quill;

  const setQuill = (el: any) => {
    quillRef = el?.getEditor();
  };

  const onChangeSelection = (range: any) => {
    if (!onHandleChangeSelection) {
      return;
    }
    quillRef.insertText(0, 'Hello');
    onHandleChangeSelection(range?.index);
  };

  return (
    <div className={styles.redactorWrapp}>
      <ReactQuill
        ref={setQuill}
        className={styles.redactor}
        theme={'snow'}
        value={data || ''}
        modules={quill}
        formats={formats}
        placeholder={'Write something...'}
        onChange={onChange}
        onChangeSelection={onChangeSelection}
      />
    </div>
  );
};

export default CustomReactQuill;
