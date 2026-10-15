function rotateGrid(grid, k) {
  const m = grid.length;
  const n = grid[0].length;
  const ans = grid.map((row) => [...row]);

  for (let top = 0, left = 0; top < Math.floor(m / 2) && left < Math.floor(n / 2); top++, left++) {
    const bottom = m - 1 - top;
    const right = n - 1 - left;
    const values = [];

    for (let col = left; col <= right; col++) values.push(grid[top][col]);
    for (let row = top + 1; row <= bottom; row++) values.push(grid[row][right]);
    for (let col = right - 1; col >= left; col--) values.push(grid[bottom][col]);
    for (let row = bottom - 1; row > top; row--) values.push(grid[row][left]);

    const shift = k % values.length;
    const rotated = values.slice(shift).concat(values.slice(0, shift));
    let index = 0;

    for (let col = left; col <= right; col++) ans[top][col] = rotated[index++];
    for (let row = top + 1; row <= bottom; row++) ans[row][right] = rotated[index++];
    for (let col = right - 1; col >= left; col--) ans[bottom][col] = rotated[index++];
    for (let row = bottom - 1; row > top; row--) ans[row][left] = rotated[index++];
  }

  return ans;
}
