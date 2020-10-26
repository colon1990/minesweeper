import React, { useReducer } from 'react';

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

const reducer = (state, { type, payload }) => {
  switch (type) {
    case actionType.UpdateIsInit:
      return { ...state, isInit: true };
    case actionType.UpdateRemainingMinesCount:
      return { ...state, remainingMinesCount: state.remainingMinesCount + payload.increment };
    case actionType.UpdateIsBust:
      return { ...state, isBust: true };
    case actionType.UpdateIsVictory:
      return { ...state, remainingMinesCount: 0, isVictory: true };
    case actionType.Reset:
      return { ...payload };
    default:
      return { ...state };
  }
};

export const Minesweeper = ({ minesCount, fieldDimension }) => {
  const {
    state: fieldState,
    reset,
    init,
    revealCell,
    plantFlag,
    revealNeighbors,
    markMines,
  } = useField({ minesCount, width: fieldDimension, height: fieldDimension });

  const initialState = { remainingMinesCount: minesCount, isInit: false, isBust: false, isVictory: false };

  const [{ remainingMinesCount, isInit, isBust, isVictory }, dispatch] = useReducer(reducer, initialState);

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
    if (some(fieldState, 'hasBustedMine')) dispatch({ type: actionType.UpdateIsBust });
    else if (!some(reject(fieldState, 'hasMine'), 'isHidden')) {
      markMines();
      dispatch({ type: actionType.UpdateIsVictory });
    }
  }, fieldState);

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
      state={fieldState}
      cellRevealHandler={handleCellReveal}
      flagPlantingHandler={handleFlagPlanting}
      neighborsRevealHandler={revealNeighbors}
    />
  </div>;
};
