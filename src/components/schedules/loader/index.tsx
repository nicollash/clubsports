/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { ProgressBar, Loader } from 'components/common';

export enum LoaderTypeEnum {
  CALCULATION = 1,
  LOADING = 2,
}

interface IProps {
  time: number;
  type: LoaderTypeEnum;
}

enum LoadingStepEnum {
  'Loading Divisions...' = 1,
  'Loading Pools...' = 2,
  'Computing Time Slots...' = 3,
  'Computing Pool Play...' = 4,
  'Solving Premier Fields...' = 5,
  'Solving Proximity and Same Facility requests...' = 6,
  'Solving Team Request...' = 7,
  'Returning Schedule Results...' = 8,
}

const SchedulesLoader = ({ time, type }: IProps) => {
  const [loadingStep, setLoadingStep] = useState(LoadingStepEnum[1]);
  const [completed, setCompleted] = useState(0);

  const loadSteps = () => {
    let i = 0;
    const stepsNum = 8;
    const updateTime = time / stepsNum;

    setTimeout(function load() {
      if (i < stepsNum) {
        i++;
        setProgress((100 / stepsNum) * i);
        setLoadingStep(LoadingStepEnum[i]);
        setTimeout(load, updateTime);
      }
    }, updateTime);
  };

  const setProgress = (progress: number) =>
    setCompleted(completed < 100 ? completed + progress : completed);

  useEffect(() => {
    loadSteps();
  }, [time]);

  const renderCalculationProgress = () => (
    <>
      <ProgressBar completed={completed} type={'loader'} />
      <div style={{ marginTop: '10px', color: '#6a6a6a' }}>{loadingStep}</div>
    </>
  );

  const renderLoadingProgress = () => (
    <>
      <Loader />
      <span style={{ marginTop: '10px', color: '#6a6a6a' }}>Loading...</span>
    </>
  );

  return (
    <>
      {type === LoaderTypeEnum.CALCULATION
        ? renderCalculationProgress()
        : renderLoadingProgress()}
    </>
  );
};

export default SchedulesLoader;
