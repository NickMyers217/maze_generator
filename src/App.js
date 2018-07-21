/// An implementation of the recursive batcktracker maze generation alrgorithm
/// For more information: https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker
import React, { Component } from 'react';
import P5Wrapper from 'react-p5-wrapper';
import { compose, filter, forEach, map, range, reverse, xprod } from 'ramda';

const sketch = function(p) {
  // TODO: expose these as props and have a ui to manipulate them?
  const WIDTH = 600;
  const HEIGHT = 600;
  const ROWS = 20;
  const COLS = 20;
  const CELL_HEIGHT = Math.floor(HEIGHT / ROWS);
  const CELL_WIDTH = Math.floor(WIDTH / COLS);
  const FPS = 60;

  const createCell = (x, y) => ({
    x,
    y,
    walls: { top: true, right: true, bottom: true, left: true },
    processed: false
  });

  const createGrid = compose(
    map(arr => createCell(...arr)),
    map(reverse),
    (rowCount, colCount) => xprod(range(0, rowCount), range(0, colCount))
  );

  const createState = (rows, cols) => {
    const grid = createGrid(rows, cols);
    return {
      grid,
      activeCell: grid[0],
      cellStack: [],
      mazeComplete: false
    };
  };

  const renderLine = (x1, y1, x2, y2, color = 255) => {
    p.stroke(color);
    p.line(x1 * CELL_WIDTH, y1 * CELL_HEIGHT, x2 * CELL_WIDTH, y2 * CELL_HEIGHT);
  };

  const renderRect = (x, y, color = 255) => {
    p.fill(color);
    p.noStroke();
    p.rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
  };

  const renderCell = ({ x, y, walls, processed }) => {
    renderRect(x, y, p.color(processed ? 101 : 51));
    if (walls.top) {
      renderLine(x, y, x + 1, y);
    }
    if (walls.right) {
      renderLine(x + 1, y, x + 1, y + 1);
    }
    if (walls.bottom) {
      renderLine(x, y + 1, x + 1, y + 1);
    }
    if (walls.left) {
      renderLine(x, y, x, y + 1);
    }
  };

  const renderCellStack = forEach(({ x, y }) => renderRect(x, y, p.color(150, 0, 150)));

  const renderActiveCell = ({ x, y }) => renderRect(x, y, p.color(0, 255, 0));

  const renderGrid = forEach(renderCell);

  const renderState = ({ grid, activeCell, cellStack }) => {
    renderGrid(grid);
    renderActiveCell(activeCell);
    renderCellStack(cellStack);
  };

  const updateState = state => {
    const getValidNeighors = cell => {
      const neighborVecs = map(arr => p.createVector(...arr), [[-1, 0], [0, -1], [1, 0], [0, 1]]);
      const isInBounds = ({ x, y }) => x >= 0 && x < COLS && y >= 0 && y < ROWS;
      const getCell = ({ x, y }) => state.grid[y * COLS + x];
      const isNotProcessed = ({ processed }) => !processed;
      const unprocessedNeighborCells = compose(
        filter(isNotProcessed),
        map(getCell),
        filter(isInBounds),
        map(vec => vec.add(cell.x, cell.y))
      )(neighborVecs);

      return unprocessedNeighborCells;
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

    const randomNeighbor = compose(
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
