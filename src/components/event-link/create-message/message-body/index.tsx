import React, { useRef, useState } from 'react';
import styles from '../styles.module.scss';
import { IInputEvent } from "common/types";
import {
  insertFormFieldButtonsLabels,
  Type,
} from "components/event-link/helpers";
import { TextField } from "@material-ui/core";
import ReactQuill, { Quill } from "react-quill";
import { InsertFormFieldButton } from "../insert-form-button-field";

const quill = {
  toolbar: [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' },
    { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

interface IProps {
  type: string;
  message: string;
  onChange: (field: string, value: string) => void;
}

const MessageBody = ({ type, message, onChange }: IProps) => {
  const [selectionPosition, setSelectionPosition] = useState<number | undefined>();
  const messageInput = useRef<HTMLInputElement | null>(null);
  let quillRef: Quill;

  const insertFormField = (value: string) => {
    type === Type.TEXT
      ? insertFormFieldInText(value)
      : insertFormFieldInEmail(value);
  };

  const insertFormFieldInEmail = (value: string) => {
    quillRef.insertText(selectionPosition || 0, value);
  };

  const insertFormFieldInText = (value: string) => {
    const selectionStart =
      Number(messageInput.current?.selectionStart) || selectionPosition;
    onMessageBodyChange(
      message.slice(0, selectionStart) + value + message.slice(selectionStart)
    );
    messageInput.current?.focus();
  };

  const setQuill = (el: any) => {
    quillRef = el?.getEditor();
  };

  const onHandleChangeSelection = (range: any) => {
    setSelectionPosition(range?.index);
  };

  const onTextMessageBodyChange = (e: IInputEvent) => {
    onChange("message", e.target.value);
  };

  const onMessageBodyChange = (value: string) => {
    onChange("message", value);
  };

  return (
    <>
      <div className={styles.messageBody}>
        <div className={styles.label}>Body of Message:</div>
        {type === Type.TEXT && (
          <TextField
            inputRef={messageInput}
            placeholder="Type the contents of your message here... Do not include poll options if the message is a poll. They are included automatically."
            multiline={true}
            variant='outlined'
            size='small'
            rows="19"
            onChange={onTextMessageBodyChange}
            value={message}
          />
        )}
        {type === Type.EMAIL && (
          <div className={styles.redactorWrapp}>
            <ReactQuill
              ref={setQuill}
              className={styles.redactor}
              theme={'snow'}
              value={message || ''}
              modules={quill}
              formats={formats}
              placeholder={'Write something...'}
              onChange={onMessageBodyChange}
              onChangeSelection={onHandleChangeSelection}
            />
          </div>
        )}
      </div>
      <div className={styles.insertFormFields}>
        <div className={styles.label}>Insert From Fields:</div>
        {insertFormFieldButtonsLabels.map((name: string) => (
          <InsertFormFieldButton
            key={name}
            formName={name}
            insertFormField={insertFormField}
          />
        ))}
      </div>
    </>
  );
};

export default MessageBody;
