// Classic dynamic-programming edit distance: the minimum number of
// single-character edits (insert, delete, substitute) needed to turn
// string a into string b. Lower number = more similar strings.
//
// Example: levenshtein('paypa1.com', 'paypal.com') === 1
// (only the '1' needs to become 'l')
export function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;

  // grid[i][j] = edit distance between a's first i chars and b's first j chars
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));

  // base cases: turning an empty string into the other costs len(other) edits
  for (let i = 0; i < rows; i++) grid[i][0] = i;
  for (let j = 0; j < cols; j++) grid[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1; // 0 if chars match, 1 if not
      grid[i][j] = Math.min(
        grid[i - 1][j] + 1,       // deletion
        grid[i][j - 1] + 1,       // insertion
        grid[i - 1][j - 1] + cost // substitution (or "free" if chars matched)
      );
    }
  }

  return grid[rows - 1][cols - 1];
}