import { useState, useMemo } from 'react';

import produce from 'immer';

import difference from 'lodash/difference';
import range from 'lodash/range';

import { cellState, cellValue } from 'const';

import { CellVM, CellNeighborsUtils } from 'view-models';

export const useField = ({ width, height, minesCount }) => {
  const length = width * height;
  const cellNeighborsUtils = new CellNeighborsUtils(width, height);

  const emptyField = useMemo(() => Array(length).fill(new CellVM), [length]);
  const [field, setField] = useState(emptyField);

  const getFloodFilledField = (address, draftFn) => produce(field, draft => {
    /* eslint-disable-line */ draftFn?.(draft);
    draft[address].state = cellState.Visible;

    const floodFill = cellAdr => {
      cellNeighborsUtils.canFloodFill(draft, cellAdr) && cellNeighborsUtils.getAddresses(cellAdr).forEach(adr => {
        const cell = draft[adr];
        const { hasMine, isHidden, hasFlag } = cell;

        if (!hasMine && isHidden && !hasFlag) {
          cell.state = cellState.Visible;

          floodFill(adr);
        }
      });
    };

    floodFill(address);
  });

  const getBustedField = draftFn => produce(field, draft => {
    draftFn(draft);

    draft.forEach((cell, adr) => {
      const { hasUnrevealedMine, hasMisplacedFlag } = cell;

      hasUnrevealedMine && (cell.state = cellState.Visible);
      hasMisplacedFlag && (draft[adr] = new CellVM(cellValue.IncorrectGuess, cellState.Visible));
    });
  });

  const reset = () => {
    setField(emptyField);
  };

  const init = address => {
    setField(getFloodFilledField(address, draft => {
      const addresses = difference(range(length), [address, ...cellNeighborsUtils.getAddresses(address)]);
      const randomAddresses = new Set;

      while (randomAddresses.size < minesCount) randomAddresses.add(addresses[Math.random() * addresses.length | 0]);

      randomAddresses.forEach(adr => {
        draft[adr].value = cellValue.Mine;
      });

      draft.forEach((cell, adr) => {
        !cell.hasMine && (cell.value = cellNeighborsUtils.getMinedCount(draft, adr));
      });
    }));
  };

  const revealCell = ({ hasMine }, address) => {
    setField(hasMine ? getBustedField(draft => {
      draft[address] = new CellVM(cellValue.BustedMine, cellState.Visible);
    }) : getFloodFilledField(address));
  };

  const plantFlag = ({ hasFlag }, address) => {
    setField(produce(field, draft => {
      draft[address].state = cellState[hasFlag ? 'Hidden' : 'Flagged'];
    }));
  };

  const revealNeighbors = address => {
    if (cellNeighborsUtils.canFloodFill(field, address)) setField(getFloodFilledField(address));
    else if (cellNeighborsUtils.canRevealNeighbors(field, address)) setField(getBustedField(draft => {
      cellNeighborsUtils.getAddresses(address).forEach(adr => {
        const cell = draft[adr];
        const { hasUnrevealedMine, hasMisplacedFlag } = cell;

        hasUnrevealedMine && (cell.value = cellValue.BustedMine);
        hasMisplacedFlag && (cell.value = cellValue.IncorrectGuess);

        cell.state = cellState.Visible;
      });
    }));
  };

  const markMines = () => {
    setField(produce(field, draft => {
      draft.forEach(cell => {
        cell.hasMine && (cell.state = cellState.Flagged);
      });
    }));
  };

  return { field, reset, init, revealCell, plantFlag, revealNeighbors, markMines };
};
