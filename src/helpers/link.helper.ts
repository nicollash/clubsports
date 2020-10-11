import { ApplicationTypes } from 'common/enums';

const stringToLink = (string: string) => {
  const link = string
    .trim()
    .toLocaleLowerCase()
    .replace(/ /g, '-');

  return link;
};

const getLinkByApp = (link: string) => {
  const location = window.location.origin;
  const isStaging = location.includes(ApplicationTypes.STAGING);

  const linkByApp = `https://${
    isStaging ? ApplicationTypes.STAGING : ApplicationTypes.MEMBERS
  }.tourneymaster.org/${link}`;

  return linkByApp;
};

export { stringToLink, getLinkByApp };
