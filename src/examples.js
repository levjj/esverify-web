export const examples = {
  max: `function max(a, b) {
  requires(typeof(a) === 'number');
  requires(typeof(b) === 'number');
  ensures(res => res >= a); // post-condition does not hold

  if (a >= b) {             // due to bug in implementation
    return b;
  } else {
    return a;
  }
}`,
  counter: `let counter = 0;
invariant(typeof counter === 'number');
invariant(counter >= 0);

function increment() {
  ensures(counter > old(counter)); // special syntax to refer to "old" value

  counter++;
}

function decrement() {
  ensures(old(counter) > 0 ? counter < old(counter) : counter === old(counter));

  if (counter > 0) counter--;
}`,
  sumTo: `function sumTo(n) {
  requires(typeof n === 'number');
  requires(n >= 0);
  ensures(res => res === (n + 1) * n / 2);

  let i = 0;
  let s = 0;
  while (i < n) {
    invariant(i <= n);                 // loop invariants need to be
    invariant(s === (i + 1) * i / 2);  // manually specified
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
  fib: `function fib(n) {
  ensures(pure());

  if (n <= 1) return 1;
  return fib(n - 1) + fib(n - 2);
}

function fibInc(n) {
  requires(typeof(n) === 'number');
  requires(n >= 0);
  ensures(fib(n) >= n);
  ensures(pure());

  fib(n);
  if (n >= 2) {
    fibInc(n - 1); fib(n - 1);
    fibInc(n - 2); fib(n - 2);
  }
}`,
  twice: `function inc(n) {
  requires(typeof(n) === 'number');
  ensures(res => res > n);

  return n + 1;
}

function twice(f, n) {
  requires(spec(f, x => typeof(x) === 'number', (x,y) => y > x));
  requires(typeof(n) === 'number');
  ensures(res => res > n + 1);

  return f(f(n));
}

const x = 3;
const y = twice(inc, x);
assert(y >= 5);`,
  fMono: `function fib(n) {
  requires(n >= 0);
  ensures(pure());
  ensures(res => typeof(res) === 'number');

  if (n <= 1) {
    return 1;
  } else {
    return fib(n - 1) + fib(n - 2);
  }
}

function fibInc(n) {
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

function fMono(f, fInc, n, m) {
  requires(spec(f, x => x >= 0, x => pure() && typeof(f(x)) === 'number'));
  requires(spec(fInc, x => x >= 0, x => pure() && f(x) <= f(x + 1)));
  requires(n >= 0);
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

function fibMono(n, m) {
  requires(n >= 0);
  requires(m >= 0);
  requires(n < m);
  ensures(pure());
  ensures(fib(n) <= fib(m));

  fMono(fib, fibInc, n, m);
}`,
  mapLen: `class List {
  constructor(head, tail) { this.head = head; this.tail = tail; }
  invariant() { return this.tail === null || this.tail instanceof List; }
}

function map(lst, f) {
  requires(lst === null || lst instanceof List);
  requires(spec(f, x => true, x => pure()));
  ensures(pure());
  ensures(res => res === null || res instanceof List);

  if (lst === null) return null;
  return new List(f(lst.head), map(lst.tail, f));
}

function len(lst) {
  requires(lst === null || lst instanceof List);
  ensures(pure());
  ensures(res => res >= 0);

  return lst === null ? 0 : len(lst.tail) + 1;
}

function mapLen(lst, f) {
  requires(spec(f, x => true, x => pure()));
  requires(lst === null || lst instanceof List);
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
}`
};
