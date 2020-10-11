import { IEntity } from 'common/types';
import { LibraryStates } from 'common/enums';

const setLibraryState = (entity: IEntity, flag: LibraryStates) => {
  const updatedEntity = {
    ...entity,
    is_library_YN: flag,
  };

  return updatedEntity;
};

export { setLibraryState };
