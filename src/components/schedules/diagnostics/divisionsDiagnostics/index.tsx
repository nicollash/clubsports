import React, { useState } from 'react';
import { Button } from 'components/common';
import { DiagnosticTypes } from 'components/schedules/types';
import Diagnostics, { IDiagnosticsInput } from '..';

interface IProps {
  divisionsDiagnostics: IDiagnosticsInput;
  recalculateDiagnostics?: () => void;
}

export default (props: IProps) => {
  const { divisionsDiagnostics, recalculateDiagnostics } = props;

  const [dianosticsOpen, setDiagnosticsOpen] = useState(false);

  const openDianostics = () => {
    if (recalculateDiagnostics) {
      recalculateDiagnostics();
    }
    setDiagnosticsOpen(true);
  };
  const closeDiagnostics = () => setDiagnosticsOpen(false);

  const filterValues = [
    {
      name: 'Division Name',
      value: '',
      index: 0,
    }
  ];

  return (
    <>
      <Button
        label="Divisions"
        variant="contained"
        color="primary"
        onClick={openDianostics}
      />
      <Diagnostics
        isOpen={dianosticsOpen}
        tableData={divisionsDiagnostics}
        onClose={closeDiagnostics}
        diagnosticType={DiagnosticTypes.DIVISIONS_DIAGNOSTICS}
        filterValues={filterValues}
      />
    </>
  );
};
