import { Storage } from 'aws-amplify';
import uuidv4 from 'uuid/v4';
import { IUploadFile } from 'common/models';

const uploadFile = (fileObject: IUploadFile) => {
  const { file, destinationType } = fileObject;
  const uuid = uuidv4();
  const saveFilePath = `event_media_files/${destinationType}_${uuid}_${file.name}`;
  const config = { contentType: file.type };

  return Storage.put(saveFilePath, file, config);
};

export { uploadFile };
