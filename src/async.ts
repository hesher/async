var map = transform => x => transform(x);
var filter = predicate => x => (predicate(x) ? x : null);

var calc = (x, modifiers) => {
  return modifiers.reduce(
    (val, currModifier) => val.map(currModifier),
    Value(x)
  );
};
export function wrap(asyncGen, modifiers = []) {
  return {
    asyncGen,
    map: transform => wrap(asyncGen, [...modifiers, map(transform)]),
    take: n => collect(asyncGen, modifiers, n),
    filter: predicate => wrap(asyncGen, [...modifiers, filter(predicate)]),
    forEach: func => act(asyncGen, modifiers, func)
  };
}
async function act(gen, modifiers, func) {
  for await (let x of gen) {
    const {value, retain} = calc(x, modifiers);
    if (retain) {
      func(value);
    }
  }
}

async function collect(gen, modifiers, n) {
  const arr = [];
  let i = n;
  for await (let x of gen) {
    const {value, retain} = calc(x, modifiers);
    if (retain) {
      arr.push(value);
      if (--i <= 0) break;
    }
  }
  return arr;
}

var Value = (value, isNull = value === null) => ({
  value,
  retain: value !== null,
  map: func => (isNull ? Value(value) : Value(func(value)))
});

export async function* on(event, element) {
  const listeners = [];
  element.addEventListener(event, ev => {
    listeners.forEach(listener => listener(ev, () => (listeners.length = 0)));
  });
  while (true) {
    yield new Promise(resolve =>
      listeners.push((ev, unregister) => {
        resolve(ev);
        unregister();
      })
    );
  }
}

// demo
var timer = (time = 500) =>
  new Promise(resolve => setTimeout(() => resolve(), time));
async function* genNums(n = 999) {
  for (let i = 0; i < n; i++) {
    yield timer(100).then(() => i);
  }
}

wrap(genNums()) // [0, 1, 2,…]
  .map(x => x + 1) // [1, 2, 3,…]
  .filter(x => x > 2) // [2, 4, 6,…]
  .map(x => x * x)
  .filter(x => x % 7 === 0)
  .take(3)
  .then(x => console.log(x));
