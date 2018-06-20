export function arraySplice<T> (array: ReadonlyArray<T>, index: number, elem: T): Array<T> {
  return [...array.slice(0, index), elem, ...array.slice(index + 1)];
}
