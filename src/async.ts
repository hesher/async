const map = transform => x => transform(x);
const filter = predicate => x => (predicate(x) ? x : null);

const calc = (x, modifiers) => {
  return modifiers.reduce(
    (val, currModifier) => val.map(currModifier),
    Value(x)
  );
};
export function wrap<T, S>(
  asyncGen: AsyncIterableIterator<T>,
  modifiers: Array<(x: T) => S> = []
) {
  return {
    asyncGen,
    map: <S>(transform) => wrap(asyncGen, [...modifiers, map(transform)]),
    filter: predicate => wrap(asyncGen, [...modifiers, filter(predicate)]),
    throttle: (time: number) => wrap(asyncGen, modifiers),
    take: (n: number) => collect(asyncGen, modifiers, n),
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

async function collect<T>(gen, modifiers, n: number) {
  const arr: T[] = [];
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

var Value = <T>(value: T, isNull = value === null) => ({
  value,
  retain: value !== null,
  map: func => (isNull ? Value(value) : Value(func(value)))
});

export async function* on(event: string, element: HTMLElement) {
  const listeners: Function[] = [];
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
