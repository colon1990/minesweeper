import React, { useReducer } from 'react';

import produce from 'immer';

import reject from 'lodash/reject';
import some from 'lodash/some';

import { useField, useDidUpdate } from 'hooks';

import { Field, Indicators } from '..';

import './Minesweeper.scss';

const actionType = {
  UpdateIsInit: 'update-is-init',
  UpdateRemainingMinesCount: 'update-remaining-mines-count',
  Reset: 'reset',
  UpdateIsBust: 'update-is-bust',
  UpdateIsVictory: 'update-is-victory',
};

const reducer = (state, { type, payload }) => type === actionType.Reset ? { ...payload } : produce(state, draft => {
  switch (type) {
    case actionType.UpdateIsInit:
      draft.isInit = true;

      break;
    case actionType.UpdateRemainingMinesCount:
      draft.remainingMinesCount += payload.increment;

      break;
    case actionType.UpdateIsBust:
      draft.isBust = true;

      break;
    case actionType.UpdateIsVictory:
      draft.remainingMinesCount = 0;
      draft.isVictory = true;
  }
});

export const Minesweeper = ({ minesCount, fieldDimension }) => {
  const initialState = { remainingMinesCount: minesCount, isInit: false, isBust: false, isVictory: false };

  const [{ remainingMinesCount, isInit, isBust, isVictory }, dispatch] = useReducer(reducer, initialState);
  const {
    field,
    reset,
    init,
    revealCell,
    plantFlag,
    revealNeighbors,
    markMines,
  } = useField({ minesCount, width: fieldDimension, height: fieldDimension });

  const handleCellReveal = (cell, address) => {
    if (isInit) revealCell(cell, address);
    else {
      init(address)
      dispatch({ type: actionType.UpdateIsInit });
    }
  };

  const handleFlagPlanting = (cell, address) => {
    plantFlag(cell, address);
    dispatch({ type: actionType.UpdateRemainingMinesCount, payload: { increment: cell.hasFlag ? 1 : -1 } });
  };

  const handleSmileyFaceClick = () => {
    reset();
    dispatch({ type: actionType.Reset, payload: initialState });
  };

  useDidUpdate(() => {
    if (some(field, 'hasBustedMine')) dispatch({ type: actionType.UpdateIsBust });
    else if (!some(reject(field, 'hasMine'), 'isHidden')) {
      markMines();
      dispatch({ type: actionType.UpdateIsVictory });
    }
  }, field);

  return <div className='minesweeper'>
    <Indicators
      minesCount={remainingMinesCount}
      isBust={isBust}
      isVictory={isVictory}
      shouldStartCountingSeconds={isInit}
      smileyFaceClickHandler={handleSmileyFaceClick}
    />

    <Field
      width={fieldDimension}
      disabled={isBust || isVictory}
      state={field}
      cellRevealHandler={handleCellReveal}
      flagPlantingHandler={handleFlagPlanting}
      neighborsRevealHandler={revealNeighbors}
    />
  </div>;
};
