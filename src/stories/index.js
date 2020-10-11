import React from 'react';
import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';
import { action } from '@storybook/addon-actions';
import StoriesWrapper from './helpers/stories-wrapper';
import '../styles/index.scss';
import HeadingLevelTwo from '../components/common/headings/heading-level-two';
import HeadingLevelThree from '../components/common/headings/heading-level-three';
import HeadingLevelFour from '../components/common/headings/heading-level-four';
import Button from '../components/common/buttons/button';
import Checkbox from '../components/common/buttons/checkbox';
import Radio from '../components/common/buttons/radio';
import TextField from '../components/common/input';
import SportsFootballIcon from '@material-ui/icons/SportsFootball';
import Select from '../components/common/select';
import DatePicker from '../components/common/date-picker';
import SectionDropdown from '../components/common/section-dropdown';
import ProgressBar from '../components/common/progress-bar';
import ColorPicker from '../components/common/color-picker';
import Paper from '../components/common/paper';
import CardMessage from '../components/common/card-message';
import { CardMessageTypes } from '../components/common/card-message/types';
import TooltipMessage from '../components/common/tooltip-message';
import { TooltipMessageTypes } from '../components/common/tooltip-message/types';
import DashboardMenu from '../components/common/menu';

storiesOf('TourneyMaster', module)
  .add('Headeings', () => (
    <StoriesWrapper>
      <HeadingLevelTwo>Heading Level Two</HeadingLevelTwo>
      <HeadingLevelThree>Heading Level Three</HeadingLevelThree>
      <HeadingLevelFour>Heading Level Four</HeadingLevelFour>
    </StoriesWrapper>
  ))
  .add('Section Dropdown', () => (
    <StoriesWrapper>
      <SectionDropdown>
        <span>Its header</span>
        <p>Threre will be content</p>
      </SectionDropdown>
    </StoriesWrapper>
  ))
  .add('Progress Bar', () => {
    const [completed, setCompleted] = React.useState(0);

    React.useEffect(() => {
      function progress() {
        setCompleted(oldCompleted => {
          if (oldCompleted === 100) {
            return 0;
          }
          const diff = Math.random() * 10;
          return Math.min(oldCompleted + diff, 100);
        });
      }

      const timer = setInterval(progress, 500);
      return () => {
        clearInterval(timer);
      };
    }, []);

    return (
      <StoriesWrapper>
        <ProgressBar completed={completed} />
      </StoriesWrapper>
    );
  })
  .add('Color Picker', () => (
    <StoriesWrapper>
      <ColorPicker />
    </StoriesWrapper>
  ))
  .add('Paper', () => (
    <StoriesWrapper>
      <Paper />
    </StoriesWrapper>
  ))
  .add('Card Message', () => (
    <>
      <StoriesWrapper>
        <CardMessage type={CardMessageTypes.INFO}>
          Playoff settings include Bracket Type, # of Teams, and Ranking Factors
        </CardMessage>
      </StoriesWrapper>
      <StoriesWrapper>
        <CardMessage type={CardMessageTypes.WARNING}>
          All existing data in the tournaments Registration section will be
          overridden!
        </CardMessage>
      </StoriesWrapper>
    </>
  ))
  .add('Tooltip Message', () => (
    <>
      <StoriesWrapper>
        <TooltipMessage
          title={'TRUE Florida (2020, 2021) cannot play 10:00 AM - 12:00 PM'}
          type={TooltipMessageTypes.WARNING}
        >
          <p>TRUE Florida (2020, 2021) cannot play 10:00 AM - 12:00 PM</p>
        </TooltipMessage>
      </StoriesWrapper>
      <StoriesWrapper>
        <TooltipMessage
          title={
            'All existing data in the tournaments Registration section will be overridden!'
          }
          type={TooltipMessageTypes.INFO}
        >
          <button>Right now!</button>
        </TooltipMessage>
      </StoriesWrapper>
    </>
  ))
  .add('Dashboard Menu', () => (
    <StoriesWrapper>
      <DashboardMenu />
    </StoriesWrapper>
  ))
  .add('Buttons', () => (
    <>
      <Button
        label="Create tournament"
        variant="contained"
        color="primary"
        onClick={action('button-click')}
      />
      <Button
        label="Link"
        variant="text"
        color="secondary"
        onClick={action('button-click')}
      />
      <Button
        label="Icon"
        variant="text"
        color="secondary"
        icon={<SportsFootballIcon />}
        onClick={action('button-click')}
      />
      <Button
        label="Squared"
        variant="contained"
        color="primary"
        type="squared"
        onClick={action('button-click')}
      />
      <Button
        label="Squared outlined"
        variant="contained"
        color="primary"
        type="squaredOutlined"
        onClick={action('button-click')}
      />
      <Button
        label="Delete"
        variant="contained"
        type="danger"
        onClick={action('button-click')}
      />
      <Checkbox
        options={['Option1', 'Option2']}
        formLabel="Choose an option"
        onChange={action('checked')}
      />
      <Radio
        options={['Male', 'Female', 'Co-Ed']}
        formLabel="Gender"
        onChange={action('changed')}
      />
    </>
  ))
  .add('Inputs', () => (
    <>
      <div style={{ padding: '10px 0' }}>
        <TextField label="Name" fullWidth onChange={action('changed')} />
      </div>

      <div style={{ padding: '10px 0' }}>
        <TextField
          endAdornment="search"
          label="Search"
          onChange={action('changed')}
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <TextField
          startAdornment={<SportsFootballIcon />}
          label="Icon"
          onChange={action('changed')}
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <TextField
          startAdornment="@"
          label="Icon"
          onChange={action('changed')}
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <TextField
          endAdornment="minutes"
          label="Duration"
          onChange={action('changed')}
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <TextField
          label="Textarea"
          multiline
          rows="4"
          onChange={action('changed')}
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <Select
          options={['Option1', 'Option2', 'Option3']}
          label={'Choose something'}
          onChange={action('selected')}
        />
      </div>
    </>
  ))
  .add('Pickers', () => (
    <>
      <div style={{ padding: '10px 0' }}>
        <DatePicker
          onChange={action('picked')}
          type="date"
          label="Choose date"
        />
      </div>
      <div style={{ padding: '10px 0' }}>
        <DatePicker
          onChange={action('picked')}
          type="time"
          label="Choose time"
        />
      </div>
    </>
  ));
