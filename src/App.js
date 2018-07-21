import React, { Component } from 'react';
import P5Wrapper from 'react-p5-wrapper';
import * as R from 'ramda';

const sketch = function(p) {
  const WIDTH = 600;
  const HEIGHT = 600;
  const ROWS = 20;
  const COLS = 20;
  const CELL_HEIGHT = Math.floor(HEIGHT / ROWS);
  const CELL_WIDTH = Math.floor(WIDTH / COLS);
  const FPS = 30;

  const createCell = (x, y) => ({
    x,
    y,
    walls: {
      top: true,
      right: true,
      bottom: true,
      left: true
    },
    processed: false
  });

  const renderCell = ({ x, y, walls, processed }) => {
    const px = x * CELL_WIDTH;
    const py = y * CELL_HEIGHT;

    p.fill(processed ? 101 : 51);
    p.noStroke();
    p.rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

    p.stroke(255);
    if (walls.top) {
      p.line(px, py, px + CELL_WIDTH, py);
    }
    if (walls.right) {
      p.line(px + CELL_WIDTH, py, px + CELL_WIDTH, py + CELL_HEIGHT);
    }
    if (walls.bottom) {
      p.line(px, py + CELL_HEIGHT, px + CELL_WIDTH, py + CELL_HEIGHT);
    }
    if (walls.left) {
      p.line(px, py, px, py + CELL_HEIGHT);
    }
  };

  const renderGrid = grid => {
    grid.forEach(renderCell);
  };

  const renderCellStack = cellStack => {
    p.fill(150, 0, 150);
    cellStack.forEach(({ x, y }) => {
      p.noStroke();
      p.rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH - 1, CELL_HEIGHT - 1);
    });
  };

  const renderActiveCell = ({ x, y }) => {
    p.fill(0, 255, 0);
    p.noStroke();
    p.rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH - 1, CELL_HEIGHT - 1);
  };

  const renderState = ({ grid, activeCell, cellStack }) => {
    renderGrid(grid);
    renderActiveCell(activeCell);
    renderCellStack(cellStack);
  };

  const updateState = state => {
    const getValidNeighors = cell => {
      const isInBounds = ({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
      const isNotProcessed = ({ processed }) => !processed;
      const getCell = ({ x, y }) => state.grid[y * COLS + x];
      const neighborVecs = [[-1, 0], [0, -1], [1, 0], [0, 1]];

      return neighborVecs
        .map(arr => p.createVector(...arr).add(cell.x, cell.y))
        .filter(isInBounds)
        .map(getCell)
        .filter(isNotProcessed);
    };
    const removeWallBetween = (cell, neighbor) => {
      const xDiff = neighbor.x - cell.x;
      const yDiff = neighbor.y - cell.y;

      if (xDiff === 1) {
        cell.walls.right = false;
        neighbor.walls.left = false;
      }
      if (xDiff === -1) {
        cell.walls.left = false;
        neighbor.walls.right = false;
      }
      if (yDiff === 1) {
        cell.walls.bottom = false;
        neighbor.walls.top = false;
      }
      if (yDiff === -1) {
        cell.walls.top = false;
        neighbor.walls.bototm = false;
      }
    };

    const randomNeighbor = R.compose(
      p.random,
      getValidNeighors
    )(state.activeCell);

    if (randomNeighbor) {
      removeWallBetween(state.activeCell, randomNeighbor);
      state.activeCell.processed = true;
      state.cellStack.push(state.activeCell);
      state.activeCell = randomNeighbor;
    } else {
      if (state.cellStack.length > 0) {
        state.activeCell.processed = true;
        state.activeCell = state.cellStack.pop();
      } else {
        state.mazeComplete = true;
      }
    }
  };

  const createGrid = (rowCount, colCount) => {
    return R.flatten(
      R.range(0, rowCount).map(y => R.range(0, colCount).map(x => createCell(x, y)))
    );
  };

  const createState = (rows, cols) => {
    const grid = createGrid(rows, cols);
    return {
      grid,
      activeCell: grid[0],
      cellStack: [],
      mazeComplete: false
    };
  };

  let state = createState(ROWS, COLS);

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    p.frameRate(FPS);
    p.background('#999999');
  };

  p.myCustomRedrawAccordingToNewPropsHandler = props => {};

  p.draw = () => {
    if (state.mazeComplete) {
      p.noLoop();
    } else {
      updateState(state);
    }

    p.clear();
    renderState(state);
  };
};

class App extends Component {
  render() {
    return (
      <div className="App" style={{ padding: '15px' }}>
        <P5Wrapper sketch={sketch} />
      </div>
    );
  }
}

export default App;
