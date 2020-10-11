import React from 'react';
import styles from '../styles.module.scss';
import waiverHubLogo from 'assets/WaiverHubLogo.png';
import {
  SectionDropdown,
  HeadingLevelThree,
  Checkbox,
} from 'components/common';
import { EventMenuTitles } from 'common/enums';
import { IEventDetails } from 'common/models';

type InputTargetValue = React.ChangeEvent<HTMLInputElement>;

enum esDetailsEnum {
  'Require Waivers' = 'waivers_required',
  'Connect to WaiverHub' = 'waiverhub_utilized',
  'Require Wellness Statement' = 'require_wellness_statement',
  'Utilize WaiverHub for Wellness Statement Management' = 'wellness_via_waiverhub',
}

interface Props {
  eventData: Partial<IEventDetails>;
  onChange: (name: string, value: string | number, ignore?: boolean) => void;
  isSectionExpand: boolean;
}

const WellnessStatement = ({ eventData, onChange, isSectionExpand }: Props) => {
  const onEsDetailsChange = (e: InputTargetValue) => {
    onChange(
      esDetailsEnum[e.target.value],
      eventData[esDetailsEnum[e.target.value]] ? 0 : 1
    );
  };

  return (
    <SectionDropdown
      id={EventMenuTitles.WELLNESS}
      type="section"
      panelDetailsType="flat"
      useShadow={true}
      expanded={isSectionExpand}
    >
      <HeadingLevelThree>
        <span className={styles.blockHeading}>
          Waivers Release and Covid-19 Statement
        </span>
      </HeadingLevelThree>
      <div className={styles.esDetailsThird}>
        <div>
          <Checkbox
            options={[
              {
                label: 'Require Waivers',
                checked: Boolean(eventData.waivers_required),
              },
            ]}
            formLabel=""
            onChange={onEsDetailsChange}
          />
          <div className={styles.waiverHubWrapper}>
            <Checkbox
              options={[
                {
                  label: 'Connect to WaiverHub',
                  checked: Boolean(eventData.waiverhub_utilized),
                },
              ]}
              formLabel=""
              onChange={onEsDetailsChange}
            />
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.waiverhub.com/"
            >
              <img
                src={waiverHubLogo}
                style={{ width: '130px' }}
                alt="Waiverhub logo"
              />
            </a>
          </div>
        </div>
        <div>
          <Checkbox
            options={[
              {
                label: 'Require Wellness Statement',
                checked: Boolean(eventData.require_wellness_statement),
              },
            ]}
            formLabel=""
            onChange={onEsDetailsChange}
          />
          <Checkbox
            options={[
              {
                label: 'Utilize WaiverHub for Wellness Statement Management',
                checked: Boolean(eventData.wellness_via_waiverhub),
              },
            ]}
            formLabel=""
            onChange={onEsDetailsChange}
          />
        </div>
      </div>
    </SectionDropdown>
  );
};

export default WellnessStatement;
