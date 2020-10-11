export const getGenderAndSportById = (
  sportId: number | undefined
): { genderId: number; sportId: number } => {
  
  switch (sportId) {
    case 1:
      return { genderId: 1, sportId: 1 };
    case 2:
      return { genderId: 2, sportId: 1 };
    case 3:
      return { genderId: 1, sportId: 2 };
    case 4:
      return { genderId: 2, sportId: 2 };
    case 5:
      return { genderId: 3, sportId: 1 };
    case 6:
      return { genderId: 3, sportId: 2 };
    default:
      return { genderId: 1, sportId: 1 };
  }
};

export const getIdByGenderAndSport = (
  genderId: number,
  sportId: number | undefined
): number => {

  if (genderId === 1 && sportId === 1) {
    return 1;
  } else if (genderId === 2 && sportId === 1) {
    return 2;
  } else if (genderId === 1 && sportId === 2) {
    return 3;
  } else if (genderId === 2 && sportId === 2) {
    return 4;
  } else if (genderId === 3 && sportId === 1) {
    return 5;
  } else if (genderId === 3 && sportId === 2) {
    return 6;
  } else {
    return 1;
  }
};
