import React, { memo } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { isBustedCell, isFlaggedCell, isHiddenCell, isMinedCell } from 'utils/check-cell';

import { cellValue } from 'const';

import './Cell.scss';

export const Cell = memo(({ state: { value }, cellRevealHandler, flagPlantingHandler, neighborsRevealHandler }) => {
  const hasGuessedIncorrectly = value === cellValue.IncorrectGuess;
  const hasBustedMine = isBustedCell(state);

  if (isHiddenCell(state)) return <div
    className='cell'
    onClick={cellRevealHandler}
    onContextMenu={flagPlantingHandler}
  />;

  if (isFlaggedCell(state)) return <div className='cell' onContextMenu={flagPlantingHandler}>
    <FontAwesomeIcon icon={['far', 'flag']} />
  </div>;

  if (value === cellValue.Empty) return <div className='cell cell__visible' />;

  if (isMinedCell(state) || hasGuessedIncorrectly || hasBustedMine) return <div
    className={`cell ${hasGuessedIncorrectly ? 'cell__incorrect-guess' : hasBustedMine ? 'cell__busted-mine' : ''}`}
  >
    <FontAwesomeIcon icon={['fas', 'bomb']} />
  </div>;

  return <div className={`cell cell__visible cell__visible__${value}`} onMouseDown={neighborsRevealHandler}>
    {value}
  </div>;
});
