const generateAbbrName = (title: string) =>
  title.replace(/(\d*\w)\w*\W*/g, (_, i) => i.toUpperCase());

export { generateAbbrName };
