import { IPool } from 'common/models';

const getPoolOptions = (pools: IPool[]) => {
  const options = pools.map(it => ({
    value: it.pool_id,
    label: it.pool_name,
  }));

  return options;
};

export { getPoolOptions };
