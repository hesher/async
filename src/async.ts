type Transform<T, S> = (v: T) => S;
type Predicate<T> = (v: T) => boolean;
const map = <T, S>(transform: Transform<T, S>) => (x: T) => transform(x);
const filter = <T>(predicate: Predicate<T>) => (x: T) =>
  predicate(x) ? x : null;

type Modifier<T, S> = Transform<T, S> | Predicate<T>;
type Listener = (...x: any[]) => void;
type Modifiers = Array<Modifier<any, any>>;

const calc = <T>(x: T, modifiers: Modifiers) => {
  return modifiers.reduce(
    (val, currModifier) => val.map(currModifier),
    Value(x)
  );
};
export function wrap<T>(
  asyncGen: AsyncIterableIterator<T>,
  modifiers: Modifiers = []
) {
  return {
    asyncGen,
    map: <S>(transform: Transform<T, S>) =>
      wrap(asyncGen, [...modifiers, map(transform)]),
    filter: (predicate: Predicate<T>) =>
      wrap(asyncGen, [...modifiers, filter(predicate)]),
    throttle: (time: number) => wrap(asyncGen, modifiers),
    take: (n: number) => collect(asyncGen, modifiers, n),
    forEach: (func: Listener) => act(asyncGen, modifiers, func)
  };
}
async function act<T>(
  gen: AsyncIterableIterator<T>,
  modifiers: Modifiers,
  func: Listener
) {
  for await (let x of gen) {
    const {value, retain} = calc(x, modifiers);
    if (retain) {
      func(value);
    }
  }
}

async function collect<T>(
  gen: AsyncIterableIterator<T>,
  modifiers: Modifiers,
  n: number
) {
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

var Value = <T>(value: T, isNull = value === null) => ({
  value,
  retain: value !== null,
  map: <S>(func: Modifier<T, S>) => (isNull ? Value(value) : Value(func(value)))
});

export async function* on(event: string, element: HTMLElement) {
  const listeners: Array<Listener> = [];
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
