import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { HeadingLevelTwo, MenuButton } from 'components/common';
import { IReport } from 'common/models';
import { ReportDataSource } from 'common/enums';
import { GridReadyEvent, GridApi, ColumnApi } from 'ag-grid-community';

import ReportEditDialog from './report-edit-dialog';
import RegistrantsReport from '../../data-sources/registrants';
import { addReport, deleteReport, updateReport } from '../../logic/actions';

import styles from './styles.module.scss';

export interface ReportViewProps {
  reports: IReport[];
  match: any;
  addReport: (report: IReport) => void;
  updateReport: (report: IReport) => void;
  deleteReport: (reportId: string) => void;
}

enum ReportDialogAction {
  SAVE,
  SAVE_AS,
  RENAME,
}

const ReportView: React.SFC<ReportViewProps> = ({
  reports,
  match,
  addReport,
  deleteReport,
  updateReport,
}) => {
  const [gridApi, setGridApi] = useState<GridApi>();
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi>();
  const reportId = match.params.reportId;
  const [report, setReport] = useState<IReport | undefined>();
  const [open, setOpen] = useState(false);
  const [reportDialogTitle, setReportDialogTitle] = useState('');
  const [reportDialogAction, setReportDialogAction] = useState(
    ReportDialogAction.SAVE
  );

  useEffect(() => {
    if (!report) {
      setReport(reports.find(x => x.report_id === reportId));
    }
  }, [report, reports, reportId]);

  const handleDelete = () => {
    deleteReport(report!.report_id);
  };

  const handleSave = (reportName?: string, groupName: string = '') => {
    if (reportName) {
      let updatedReport: IReport;
      switch (reportDialogAction) {
        case ReportDialogAction.SAVE:
          updatedReport = {
            ...report!,
            report_name: reportName,
            reporting_group1: groupName,
            config_details: JSON.stringify({
              columnState: gridColumnApi?.getColumnState(),
              columnGroupState: gridColumnApi?.getColumnGroupState(),
              sortModel: gridApi?.getSortModel(),
            }),
          };
          updateReport(updatedReport);
          break;
        case ReportDialogAction.RENAME:
          updatedReport = {
            ...report!,
            report_name: reportName,
            reporting_group1: groupName,
          };
          updateReport(updatedReport);
          break;
        case ReportDialogAction.SAVE_AS:
          updatedReport = {
            ...report!,
            report_name: reportName,
            reporting_group1: groupName,
            config_details: JSON.stringify({
              columnState: gridColumnApi?.getColumnState(),
              columnGroupState: gridColumnApi?.getColumnGroupState(),
              sortModel: gridApi?.getSortModel(),
            }),
          };
          delete updatedReport.report_id;
          delete updatedReport.is_default_YN;
          delete updatedReport.is_favorite_YN;
          addReport(updatedReport);
          break;
      }
      setReport(updatedReport);
      setOpen(false);
    }
  };

  const handleClickSave = () => {
    setReportDialogAction(ReportDialogAction.SAVE);
    setReportDialogTitle('Save Report');
    setOpen(true);
  };

  const handleClickSaveAs = () => {
    setReportDialogAction(ReportDialogAction.SAVE_AS);
    setReportDialogTitle('Save Report As...');
    setOpen(true);
  };

  const handleClickRename = () => {
    setReportDialogAction(ReportDialogAction.RENAME);
    setReportDialogTitle('Rename Report');
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const getSavedColumnState = () => {
    try {
      return JSON.parse(report?.config_details!);
    } catch (err) {
      return { columnState: null, columnGroupState: null, sortModel: null };
    }
  };

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    const { columnState, columnGroupState, sortModel } = getSavedColumnState();
    params.columnApi.setColumnGroupState(columnGroupState);
    params.columnApi.setColumnState(columnState);
    params.api.setSortModel(sortModel);
  };

  const getReportComponent = (dataSource?: ReportDataSource) => {
    switch (dataSource) {
      case ReportDataSource.REGISTRANTS:
        return (
          <RegistrantsReport
            onGridReady={onGridReady}
            gridApi={gridApi}
            gridColumnApi={gridColumnApi}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={styles.heading}>
        <HeadingLevelTwo>{report?.report_name}</HeadingLevelTwo>
        <div>
          {open && (
            <ReportEditDialog
              open={open}
              title={reportDialogTitle}
              initialGroupName={report?.reporting_group1}
              initialReportName={
                report?.report_name +
                (reportDialogAction === ReportDialogAction.SAVE_AS
                  ? ' Copy'
                  : '')
              }
              handleSave={handleSave}
              handleCancel={handleCancel}
            />
          )}
          <MenuButton
            label='Actions'
            variant='contained'
            color='primary'
            menuItems={[
              {
                label: 'Save',
                action: handleClickSave,
                disabled: report?.is_default_YN === 1,
              },
              { label: 'Save As...', action: handleClickSaveAs },
              {
                label: 'Rename',
                action: handleClickRename,
                disabled: report?.is_default_YN === 1,
              },
              {
                label: 'Delete',
                action: handleDelete,
                disabled: report?.is_default_YN === 1,
              },
            ]}
          ></MenuButton>
          &nbsp;
          <MenuButton
            label='Export'
            variant='contained'
            color='primary'
            menuItems={[
              { label: '... to CSV', action: () => gridApi?.exportDataAsCsv() },
              {
                label: '... to Excel',
                action: () => gridApi?.exportDataAsExcel(),
              },
            ]}
          />
        </div>
      </div>
      {getReportComponent(report?.data_source_id)}
    </>
  );
};

interface IState {
  reports: { reports: IReport[] };
}

const mapStateToProps = (state: IState) => ({
  reports: state.reports.reports,
});

const mapDispatchToProps = {
  addReport,
  deleteReport,
  updateReport,
};

export default connect(mapStateToProps, mapDispatchToProps)(ReportView);
