import React from 'react';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums';

const STYLES_ICON = {
  width: '20px',
  height: '20px',
  marginRight: '9px',
};

interface Props {
  isComplete: boolean;
  title: string;
}

const publishedItem = ({ isComplete, title }: Props) => (
  <li>
    {isComplete
      ? getIcon(Icons.CHECK_CIRCLE, {
          ...STYLES_ICON,
          fill: '#00CC47',
        })
      : getIcon(Icons.WARNING, {
          ...STYLES_ICON,
          fill: '#FFCB00',
        })}
    {title}
  </li>
);

export default publishedItem;
