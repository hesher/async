type Transform<T, S> = (v: T) => S;
type Predicate<T> = (v: T) => boolean;
const map = <T, S>(transform: Transform<T, S>) => (x: T) => transform(x);
const filter = <T>(predicate: Predicate<T>) => (x: T) =>
  predicate(x) ? x : null;

type Modifier<T, S> = Transform<T, S> | Predicate<T>;
type Listener<T = any, S = any> = (x: T, y?: S, rest?: any[]) => void;
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
    take: <W = any>(n: number): Promise<W[]> => collect(asyncGen, modifiers, n),
    forEach: <W = any>(func: Listener<W>) => act(asyncGen, modifiers, func)
  };
}
async function act<T, W>(
  gen: AsyncIterableIterator<T>,
  modifiers: Modifiers,
  func: Listener<W>
) {
  for await (let x of gen) {
    const {value, retain} = calc(x, modifiers);
    if (retain) {
      func(value);
    }
  }
}

async function collect<T, W>(
  gen: AsyncIterableIterator<T>,
  modifiers: Modifiers,
  n: number
): Promise<W[]> {
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
  const listeners: Array<Listener<any>> = [];
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
