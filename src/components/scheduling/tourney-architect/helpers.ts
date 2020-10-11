import { Icons } from 'common/enums';
const getIconStyles = (icon: Icons) => {
  let BASE_STYLES = {
    marginLeft: '5px',
  };

  switch (icon) {
    case Icons.INFO: {
      return {
        ...BASE_STYLES,
        fill: '#00A3EA',
      };
    }
    case Icons.WARNING: {
      return {
        ...BASE_STYLES,
        fill: '#FFCB00',
      };
    }
  }

  return BASE_STYLES;
};

export { getIconStyles };
