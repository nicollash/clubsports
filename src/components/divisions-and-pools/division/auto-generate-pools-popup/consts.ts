﻿export enum PoolNaming {
  DIRECTION = 'Directions (North, South, East, West, ...)',
  COLOR = 'Colors (Blue, Black, White, Red, ...)',
  ALPHABET = 'NATO (Alpha, Bravo, Charlie, Delta, ...)',
};

export const directionsNames = [
  "North",
  "South",
  "West",
  "East",
  "Northeast",
  "Northwest",
  "Southeast",
  "Southwest",
  "Northside",
  "Southside",
];

export const colorsNames = [
  "Blue",
  "White",
  "Black",
  "Red",
  "Green",
  "Maroon",
  "Purple",
  "Silver",
  "Gold",
  "Bronze",
];

export const alphabetNames = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliette",
];

export const namesMatching = [
  {
    option: PoolNaming.DIRECTION,
    names: directionsNames,
  },
  {
    option: PoolNaming.COLOR,
    names: colorsNames,
  },
  {
    option: PoolNaming.ALPHABET,
    names: alphabetNames,
  },
];

export const PoolColorMatching = [
  {
    color: 'blue',
    hex: '4f61a1',
  },
  {
    color: 'red',
    hex: 'dd546e',
  },
  {
    color: 'purple',
    hex: '5a4aa5',
  },
  {
    color: 'green',
    hex: '43b581',
  },
  {
    color: 'yellow',
    hex: 'f3c366',
  },
  {
    color: 'gray',
    hex: '99aab5',
  },
  {
    color: 'gold',
    hex: 'FFD700',
  },
  {
    color: 'bronze',
    hex: 'cd7f32',
  },
  {
    color: 'silver',
    hex: 'C0C0C0',
  },
  {
    color: 'black',
    hex: 'ffffff',
  },
];

export const optionsAutogeneratePoools = [
  {
    label: PoolNaming.DIRECTION,
    value: PoolNaming.DIRECTION,
  },
  {
    label: PoolNaming.COLOR,
    value: PoolNaming.COLOR,
  },
  {
    label: PoolNaming.ALPHABET,
    value: PoolNaming.ALPHABET,
  },
];

