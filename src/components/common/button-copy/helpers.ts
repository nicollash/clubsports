const copyToClipboard = (copyString: string) => {
  const tempInput = document.createElement('input');

  tempInput.value = copyString;

  document.body.appendChild(tempInput);

  tempInput.select();

  document.execCommand('copy');

  document.body.removeChild(tempInput);
};

export { copyToClipboard };
