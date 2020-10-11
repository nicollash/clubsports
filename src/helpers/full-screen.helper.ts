const openFullscreen = (elem: HTMLElement) => elem.requestFullscreen();
const closeFullscreen = () => document.exitFullscreen();

export { openFullscreen, closeFullscreen };
