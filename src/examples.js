export const examples = {
  max: `// This is a live demo, simply edit the code and click "verify" above!

function max(a, b) {
  requires(typeof(a) === 'number');
  requires(typeof(b) === 'number');
  ensures(res => res >= a);
  ensures(res => res >= b); // this post-condition does not hold

  if (a >= b) {
    return a;
  } else {
    return a;               // due to a bug in the implementation
  }
}`,
  counter: `let counter = 0;
invariant(Number.isInteger(counter));
invariant(counter >= 0);

function increment () {
  ensures(counter > old(counter));

  counter++;
}

function decrement () {
  ensures(old(counter) > 0 ? counter < old(counter) : counter === old(counter));

  if (counter > 0) counter--;
}`,
  sumTo: `function sumTo (n) {
  requires(Number.isInteger(n));
  requires(n >= 0);
  ensures(res => res === (n + 1) * n / 2);

  let i = 0;
  let s = 0;
  while (i < n) {
    invariant(i <= n);
    invariant(s === (i + 1) * i / 2);
    invariant(Number.isInteger(i));
    invariant(Number.isInteger(s));
    i++;
    s = s + i;
  }
  return s;
}`,
  inc: `function inc(n) {
  return n + 1;
}

let i = 3;
let j = inc(i);      // call automatically inlines function body
assert(j === 4);`,
  cons: `function cons(x) {
  function f () { return x; }
  return f;
}
const g = cons(1);
const g1 = g();
assert(g1 === 1);
const h = cons(2);
const h1 = h();
assert(h1 === 2);`,
  f: `let x = 0;

function f() { ensures(pure()); x++; }       // not actually pure
function g() { ensures(pure()); return x + 1; }
function h1() { /*empty*/ }
function h2a() { h1(); }
function h2b() { ensures(pure()); h1(); }    // inlining h1 shows purity
function h3a() { ensures(pure()); h2a(); }   // not verified because inlining restricted to one level
function h3b() { ensures(pure()); h2b(); }   // verified because h2b marked as pure`,
  twice: `function inc (n) {
  requires(Number.isInteger(n));
  ensures(res => Number.isInteger(res) && res > n);

  return n + 1;
}

function twice (f, n) {
  requires(spec(f, x => Number.isInteger(x), (x, y) => Number.isInteger(y) && y > x));
  requires(Number.isInteger(n));
  ensures(res => res > n + 1);

  return f(f(n));
}

const x = 3;
const y = twice(inc, x);
assert(y > 4);`,
  fMono: `function fib (n) {
  requires(Number.isInteger(n));
  requires(n >= 0);
  ensures(pure());
  ensures(res => Number.isInteger(res));

  if (n <= 1) {
    return 1;
  } else {
    return fib(n - 1) + fib(n - 2);
  }
}

function fibInc (n) {
  requires(Number.isInteger(n));
  requires(n >= 0);
  ensures(fib(n) <= fib(n + 1));
  ensures(pure());

  fib(n);
  fib(n + 1);

  if (n > 0) {
    fib(n - 1);
    fibInc(n - 1);
  }

  if (n > 1) {
    fib(n - 2);
    fibInc(n - 2);
  }
}

function fMono (f, fInc, n, m) {
  requires(spec(f, x => Number.isInteger(x) && x >= 0,
                   (x, y) => pure() && Number.isInteger(y)));
  requires(spec(fInc, x => Number.isInteger(x) && x >= 0,
                      x => pure() && f(x) <= f(x + 1)));
  requires(Number.isInteger(n));
  requires(n >= 0);
  requires(Number.isInteger(m));
  requires(m >= 0);
  requires(n < m);
  ensures(pure());
  ensures(f(n) <= f(m));

  if (n + 1 === m) {
    fInc(n);
  } else {
    fInc(n);
    fMono(f, fInc, n + 1, m);
  }
}

function fibMono (n, m) {
  requires(Number.isInteger(n));
  requires(n >= 0);
  requires(Number.isInteger(m));
  requires(m >= 0);
  requires(n < m);
  ensures(pure());
  ensures(fib(n) <= fib(m));

  fMono(fib, fibInc, n, m);
}`,
  adder: `class Adder {
  constructor (base) {
    this.base = base;
  }
  invariant () {
    return typeof this.base === 'number';
  }
  addTo (n) {
    requires(typeof n === 'number');
    return this.base + n;
  }
}

const adder = new Adder(5);
const m = adder.addTo(3);
assert(m === 8);

function f (a) {
  requires(a instanceof Adder);
  ensures(res => res !== 2); // does not hold if a is "new A(1)"

  return a.addTo(1);
}`,
  mapLen: `class List {
  constructor (head, tail) { this.head = head; this.tail = tail; }
  invariant () { return this.tail === null || this.tail instanceof List; }
}

function map (lst, f) {
  requires(lst === null || lst instanceof List);
  requires(spec(f, x => true, x => pure()));
  ensures(pure());
  ensures(res => res === null || res instanceof List);

  if (lst === null) return null;
  return new List(f(lst.head), map(lst.tail, f));
}

function len (lst) {
  requires(lst === null || lst instanceof List);
  ensures(pure());
  ensures(res => typeof res === 'number' && res >= 0);

  return lst === null ? 0 : len(lst.tail) + 1;
}

function mapLen (lst, f) {
  requires(lst === null || lst instanceof List);
  requires(spec(f, x => true, x => pure()));
  ensures(pure());
  ensures(len(lst) === len(map(lst, f)));

  const l = len(lst);
  const r = len(map(lst, f));
  if (lst === null) {
    assert(l === 0);
    assert(r === 0);
  } else {
    const l1 = len(lst.tail);
    assert(l === l1 + 1);

    f(lst.head);
    const r1 = len(map(lst.tail, f));
    assert(r === r1 + 1);

    mapLen(lst.tail, f);
    assert(l1 === r1);
    assert(l === r);
  }
}`,
  msort: `class IntList {
  constructor (head, tail) {
    this.head = head;
    this.tail = tail;
  }
  invariant () {
    return typeof(this.head) === 'number' &&
           (this.tail === null || this.tail instanceof IntList);
  }
}

class IntListPartition {
  constructor (left, right) {
    this.left = left;
    this.right = right;
  }
  invariant () {
    return (this.left === null || this.left instanceof IntList) &&
           (this.right === null || this.right instanceof IntList);
  }
}

function partition (lst, fst, snd, alternate) {
  requires(lst === null || lst instanceof IntList);
  requires(fst === null || fst instanceof IntList);
  requires(snd === null || snd instanceof IntList);
  requires(typeof(alternate) === 'boolean');
  ensures(res => res instanceof IntListPartition);
  ensures(pure());

  if (lst === null) {
    return new IntListPartition(fst, snd);
  } else if (alternate) {
    return partition(lst.tail, new IntList(lst.head, fst), snd, false);
  } else {
    return partition(lst.tail, fst, new IntList(lst.head, snd), true);
  }
}

function isSorted (list) {
  requires(list === null || list instanceof IntList);
  ensures(res => typeof(res) === 'boolean');
  ensures(pure());

  return list === null || list.tail === null ||
        list.head <= list.tail.head && isSorted(list.tail);
}

function merge (left, right) {
  requires(left === null || left instanceof IntList);
  requires(isSorted(left));
  requires(right === null || right instanceof IntList);
  requires(isSorted(right));
  ensures(res => res === null || res instanceof IntList);
  ensures(res => isSorted(res));
  ensures(res => (left === null && right === null) === (res === null));
  ensures(res => !(left !== null && (right === null || right.head >= left.head))
                  ||
                (res !== null && res.head === left.head));
  ensures(res => !(right !== null && (left === null || right.head < left.head))
                  ||
                (res !== null && res.head === right.head));
  ensures(pure());

  if (left === null) {
    return right;
  } else if (right === null) {
    return left;
  } else if (left.head <= right.head) {
    isSorted(left);
    isSorted(left.tail);
    const merged = merge(left.tail, right);
    const res = new IntList(left.head, merged);
    isSorted(res);
    return res;
  } else {
    isSorted(right);
    isSorted(right.tail);
    const merged = merge(left, right.tail);
    const res = new IntList(right.head, merged);
    isSorted(res);
    return res;
  }
}

function sort (list) {
  requires(list === null || list instanceof IntList);
  ensures(res => res === null || res instanceof IntList);
  ensures(res => isSorted(res));
  ensures(pure());

  if (list === null || list.tail === null) {
    isSorted(list);
    assert(isSorted(list));
    return list;
  }
  const part = partition(list, null, null, false);
  return merge(sort(part.left), sort(part.right));
}`,
  arrays: `const a1 = [23];
assert(a1 instanceof Array);
assert(a1 instanceof Object);
assert('length' in a1);
assert(a1.length === 1);
assert(0 in a1);
assert(a1[0] > 22);
const p = 3 - 2 - 1;
assert(a1[p] > 22);
const arr = [1, 2, 3];
const sliced = arr.slice(1, 2);
assert(sliced.length === 1);
assert(sliced[0] === 2);`,
  strings: `const s1 = 'hello';
assert(s1.length === 5);
const l2 = (s1 + ' world').length;
const l3 = s1.length + ' world'.length;
assert(l2 === l3);
assert(l2 === 11);
const c1 = s1[0];
const c2 = s1[3 - 2];
assert(c1 === 'h');
assert(c2 === 'e');
const str = 'abcd';
const substr = str.substr(1, 2);
assert(substr === 'bc');`
};
