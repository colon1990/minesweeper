import { cellState, cellValue } from 'const';

const checkCell = (cell, prop, criteria) => cell[prop] === criteria;

export const isMinedCell = cell => checkCell(cell, 'value', cellValue.Mine);
export const isHiddenCell = cell => checkCell(cell, 'state', cellState.Hidden);
export const isFlaggedCell = cell => checkCell(cell, 'state', cellState.Flagged);
export const isBustedCell = cell => checkCell(cell, 'value', cellValue.BustedMine);
