import React from 'react';
import HeadeingLevelThree from '../headings/heading-level-three';
import {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ExpansionPanel,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { stringToLink } from 'helpers';
import styles from './styles.module.scss';
import { BindingAction } from 'common/models';

type DropdownType = 'section' | 'block';

interface Props {
  id?: string | null;
  children: React.ReactElement[];
  type?: DropdownType;
  isDefaultExpanded?: boolean;
  headingColor?: string;
  useShadow?: boolean;
  panelDetailsType?: string;
  expanded?: boolean;
  onToggle?: BindingAction;
  isToggleCollapse?: boolean;
}

const setStyleOnType = (type?: DropdownType) => {
  switch (type) {
    case 'section':
      return {
        background: 'transparent',
        boxShadow: 'none',
      };
    default:
      return {
        background: '#F4F4F4',
        boxShadow: '0 1px 10px 0 rgba(0,0,0,0.1)',
      };
  }
};

const setPanelDetailsStyle = (type: string) => {
  switch (type) {
    case 'flat':
      return {
        padding: '0',
      };
  }
};

const setExpandIcon = (type?: DropdownType) =>
  type && type === 'section' ? (
    <ExpandMoreIcon />
  ) : (
    <ExpandMoreIcon color="primary" fontSize="large" />
  );

const setPanelSummaryStyle = (type?: DropdownType) =>
  type && type === 'section' ? { paddingLeft: 0 } : {};

const SectionDropdown = ({
  id,
  children,
  type,
  headingColor,
  isDefaultExpanded,
  useShadow,
  panelDetailsType,
  expanded,
  onToggle,
}: Props) => {
  const [isExpanded, onChangeExpanded] = React.useState(expanded);

  React.useEffect(() => {
    onChangeExpanded(expanded);
  }, [expanded]);

  const defaulOnClick = () => onChangeExpanded(!isExpanded);

  return (
    <section className={styles.section} id={id ? stringToLink(id) : undefined}>
      <ExpansionPanel
        style={{
          ...setStyleOnType(type),
          boxShadow: useShadow ? '10px 5px 5px #d3d3dd' : 'none',
        }}
        defaultExpanded={isDefaultExpanded}
        expanded={isExpanded}
      >
        <ExpansionPanelSummary
          style={{
            ...setPanelSummaryStyle(type),
            display: 'flex',
            paddingLeft: '5px',
          }}
          expandIcon={setExpandIcon(type)}
          aria-controls="panel1a-content"
          id="panel1a-header"
          onClick={onToggle || defaulOnClick}
        >
          <span style={{ width: '100%' }}>
            <HeadeingLevelThree color={headingColor}>
              {children[0]}
            </HeadeingLevelThree>
          </span>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails
          style={
            panelDetailsType
              ? {
                  ...setPanelDetailsStyle(panelDetailsType),
                  padding: 5,
                }
              : {}
          }
        >
          {children[1]}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </section>
  );
};

export default SectionDropdown;
