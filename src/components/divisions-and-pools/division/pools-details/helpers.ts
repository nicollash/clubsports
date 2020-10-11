const getBackgroundColor = (isActive: boolean, canDrop: boolean) => {
  let backgroundColor = '';

  if (isActive) {
    backgroundColor = '#dcdcdc';
  } else if (canDrop) {
    backgroundColor = '#eaeaea';
  }

  return backgroundColor;
};

export { getBackgroundColor };
