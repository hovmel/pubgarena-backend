function areIdsEqual(first, second) {
  if (!first || !second) return false;
  return first.toString() === second.toString();
}

export default areIdsEqual;
