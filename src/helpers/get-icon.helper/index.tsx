import React from 'react';
import AssessmentIcon from '@material-ui/icons/Assessment';
import PersonIcon from '@material-ui/icons/Person';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import EmailIcon from '@material-ui/icons/Email';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import PeopleIcon from '@material-ui/icons/People';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import SettingsIcon from '@material-ui/icons/Settings';
import ErrorIcon from '@material-ui/icons/Error';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import DescriptionIcon from '@material-ui/icons/Description';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import RoomIcon from '@material-ui/icons/Room';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import CreateIcon from '@material-ui/icons/Create';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import WarningIcon from '@material-ui/icons/Warning';
import FileCopy from '@material-ui/icons/FileCopy';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DoneIcon from '@material-ui/icons/Done';
import SettingsBackupRestoreIcon from '@material-ui/icons/SettingsBackupRestore';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import InfoIcon from '@material-ui/icons/Info';
import PrintIcon from '@material-ui/icons/Print';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import PanToolIcon from '@material-ui/icons/PanTool';
import FlipToBackIcon from '@material-ui/icons/FlipToBack';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import VisibilityIcon from '@material-ui/icons/Visibility';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import CloseIcon from '@material-ui/icons/Close';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import MenuIcon from '@material-ui/icons/Menu';
import CrossImage from '../../../src/assets/moveIcon.svg';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import { PinIcon } from './own-icons';
import { Icons } from 'common/enums/icons';

const getIcon = (icon: string, iconStyles?: object): JSX.Element => {
  switch (icon) {
    case Icons.ASSESSMENT:
      return <AssessmentIcon style={iconStyles} />;
    case Icons.PERSON:
      return <PersonIcon style={iconStyles} />;
    case Icons.INSERT_DRIVE:
      return <InsertDriveFileIcon style={iconStyles} />;
    case Icons.EMAIL:
      return <EmailIcon style={iconStyles} />;
    case Icons.EXPLAND_MORE:
      return <ExpandMoreIcon style={iconStyles} />;
    case Icons.PEOPLE:
      return <PeopleIcon style={iconStyles} />;
    case Icons.CALENDAR:
      return <CalendarTodayIcon style={iconStyles} />;
    case Icons.SETTINGS:
      return <SettingsIcon style={iconStyles} />;
    case Icons.ERROR:
      return <ErrorIcon style={iconStyles} />;
    case Icons.PIN:
      return <PinIcon style={iconStyles} />;
    case Icons.CLOCK:
      return <WatchLaterIcon style={iconStyles} />;
    case Icons.DESCRIPTION:
      return <DescriptionIcon style={iconStyles} />;
    case Icons.LIST:
      return <FormatListBulletedIcon style={iconStyles} />;
    case Icons.TEAM:
      return <GroupAddIcon style={iconStyles} />;
    case Icons.PLACE:
      return <RoomIcon style={iconStyles} />;
    case Icons.SCORING:
      return <CreateIcon style={iconStyles} />;
    case Icons.EDIT:
      return <EditIcon style={iconStyles} />;
    case Icons.SAVE:
      return <SaveIcon style={iconStyles} />;
    case Icons.DELETE:
      return <DeleteIcon style={iconStyles} />;
    case Icons.GET_APP:
      return <GetAppIcon style={iconStyles} />;
    case Icons.PUBLISH:
      return <PublishIcon style={iconStyles} />;
    case Icons.EMODJI_OBJECTS:
      return <EmojiObjectsIcon style={iconStyles} />;
    case Icons.WARNING:
      return <WarningIcon style={iconStyles} />;
    case Icons.FILE_COPY:
      return <FileCopy style={iconStyles} />;
    case Icons.CHECK_CIRCLE:
      return <CheckCircleIcon style={iconStyles} />;
    case Icons.DONE:
      return <DoneIcon style={iconStyles} />;
    case Icons.SETTINGS_BACKUP_RESTORE:
      return <SettingsBackupRestoreIcon style={iconStyles} />;
    case Icons.LOCK:
      return <LockIcon style={iconStyles} />;
    case Icons.LOCK_OPEN:
      return <LockOpenIcon style={iconStyles} />;
    case Icons.INFO:
      return <InfoIcon style={iconStyles} />;
    case Icons.PRINT:
      return <PrintIcon style={iconStyles} />;
    case Icons.ZOOM:
      return <ZoomOutMapIcon style={iconStyles} />;
    case Icons.MOVE:
      return <PanToolIcon style={iconStyles} />;
    case Icons.FLIP:
      return <FlipToBackIcon style={iconStyles} />;
    case Icons.DROPDOWN:
      return <ArrowDropDownIcon style={iconStyles} />;
    case Icons.DROPUP:
      return <ArrowDropUpIcon style={iconStyles} />;
    case Icons.CLEAR:
      return <ClearIcon style={iconStyles} />;
    case Icons.EYE:
      return <VisibilityIcon style={iconStyles} />;
    case Icons.FULL_SCREEN:
      return <FullscreenIcon style={iconStyles} />;
    case Icons.FULL_SCREEN_EXIT:
      return <FullscreenExitIcon style={iconStyles} />;
    case Icons.ARROW_RIGHT:
      return <ArrowRightAltIcon style={iconStyles} />;
    case Icons.CLOSE:
      return <CloseIcon style={iconStyles} />;
    case Icons.SWAPVERT:
      return <SwapVertIcon style={iconStyles} />;
    case Icons.EXPAND_MORE:
      return <ExpandMoreIcon style={iconStyles} />;
    case Icons.EXPAND_LESS:
      return <ExpandLessIcon style={iconStyles} />;
    case Icons.MENU:
      return <MenuIcon style={iconStyles} />;
    case Icons.FULL_SCREEN_CROSS:
      return <img src={CrossImage} alt="Cross"/>
    case Icons.NOTEADD:
      return <NoteAddIcon style={iconStyles}/>
  }
  return <ClearIcon />;
};

export { getIcon };
