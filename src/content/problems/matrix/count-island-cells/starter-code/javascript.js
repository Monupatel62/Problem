function countIslandCells(grid) {
  let count = 0;
  for (const row of grid) for (const cell of row) if (cell === 1) count++;
  return count;
}
