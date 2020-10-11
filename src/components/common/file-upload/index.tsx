import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getIcon } from 'helpers/get-icon.helper';
import { Icons } from 'common/enums';
import { Button } from 'components/common';
import styles from './styles.module.scss';

const STYLES_PUBLISH_ICON = {
  marginRight: '5px',
};

enum FileUploadTypes {
  BUTTON = 'button',
  SECTION = 'section',
}

enum AcceptFileTypes {
  JPG = '.jpg',
  JPEG = '.jpeg',
  PNG = '.png',
  SVG = '.svg',
  PDF = '.pdf',
  CSV = '.csv',
  JFIF = '.jfif',
}

interface IProps {
  type: FileUploadTypes;
  incomingFiles?: File[];
  onUpload: (files: File[]) => void;
  acceptTypes: AcceptFileTypes[];
  onFileRemove?: (files: File[]) => void;
  logo?: string;
  btnLabel?: string;
  withoutRemoveBtn?: boolean;
}

const FileUpload: React.FC<IProps> = props => {
  const {
    type,
    acceptTypes,
    incomingFiles,
    onUpload,
    onFileRemove,
    logo,
    btnLabel,
    withoutRemoveBtn,
  } = props;
  const [files, setFiles] = useState<File[] | null>(incomingFiles || null);

  const onDrop = useCallback((uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    onUpload(uploadedFiles);
    // eslint-disable-next-line
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: acceptTypes,
  });

  const removeFiles = () => {
    setFiles(null);
    if (onFileRemove && files) {
      onFileRemove(files);
    }
  };

  const showFiles = (): string => {
    return files ? files.map(file => file.name).join(', ') : '';
  };

  const renderFiles = () => {
    if (withoutRemoveBtn) {
      return (
        <div className={styles.withoutRemoveBtnUploader}>{showFiles()}</div>
      );
    } else {
      return (
        <div className={styles.uploadedWrapper}>
          <span className={styles.uploadedWrapperText}>File: </span>
          {showFiles()}
          <Button
            label="Remove"
            variant="text"
            color="secondary"
            onClick={removeFiles}
          />
        </div>
      );
    }
  };

  const renderWhileDragging = () => <span>Drop files here</span>;

  const renderUploader = () =>
    isDragActive ? (
      renderWhileDragging()
    ) : (
      <>
        {logo && (
          <img
            src={`https://tourneymaster.s3.amazonaws.com/public/${logo}`}
            className={styles.logo}
            alt="Event Logo"
          />
        )}
        <span>Drag & Drop files here</span>
        <span>or</span>

        <Button
          label="Browse files"
          color="primary"
          variant="contained"
          type="squared"
        />
      </>
    );

  const renderUploaderType = (uploadType: FileUploadTypes) => {
    switch (uploadType) {
      case FileUploadTypes.SECTION:
        return (
          <div className={styles.wrapper}>
            <div {...getRootProps()} className={styles.container}>
              {Boolean(!files?.length) && !logo && (
                <FontAwesomeIcon icon={faUpload} />
              )}

              {Boolean(files?.length) && renderFiles()}

              {Boolean(!files?.length) && renderUploader()}

              <input disabled={!!files?.length} {...getInputProps()} />
            </div>
          </div>
        );
      case FileUploadTypes.BUTTON:
        return (
          <div
            className={
              withoutRemoveBtn
                ? styles.withoutRemoveBtnWrapper
                : styles.btnWrapper
            }
          >
            <label className={styles.loadBtn}>
              <input {...getInputProps()} />
              {getIcon(Icons.PUBLISH, STYLES_PUBLISH_ICON)}
              {btnLabel || 'Upload Field Map'}
            </label>
            {Boolean(files?.length) && renderFiles()}
          </div>
        );
    }
  };

  return renderUploaderType(type);
};

export { FileUploadTypes, AcceptFileTypes };

export default FileUpload;
