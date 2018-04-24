import {AggVal} from './AggVal';
import {buffer} from './buffer';
import {throttle} from './throttle';
const Null = <T>(x): AggVal<null> => ({
  ...x,
  nulled: true
});

const map = transform => <T>(x: AggVal<T>) => ({...x, val: transform(x.val)});
const filter = predicate => <T>(x: AggVal<T>) => {
  return predicate(x.val) ? x : Null(x);
};

const calc = <T>(x: T, modifiers, prevX: T) => {
  return modifiers.reduce(
    (val, currModifier) => val.map(currModifier, prevX),
    Value({val: x, nulled: false, props: {}})
  );
};
export function wrap<T, S>(
  asyncGen: AsyncIterableIterator<T>,
  modifiers: Array<
    (x: AggVal<T>, prev: AggVal<T>) => AggVal<S> | AggVal<T>
  > = []
) {
  return {
    asyncGen,
    map: <S>(transform) => wrap(asyncGen, [...modifiers, map(transform)]),
    filter: predicate => wrap(asyncGen, [...modifiers, filter(predicate)]),
    throttle: (time: number) => wrap(asyncGen, [...modifiers, throttle(time)]),
    buffer: (size: number) => wrap(asyncGen, [...modifiers, buffer(size)]),
    take: (n: number) => collect(asyncGen, modifiers, n),
    forEach: func => act(asyncGen, modifiers, func)
  };
}
async function act<T>(gen, modifiers, func) {
  let prevX: AggVal<null> | AggVal<T> = {
    val: null,
    nulled: false,
    props: {}
  };
  for await (const x of gen) {
    const curr = calc(x, modifiers, prevX).value as AggVal<T>;
    prevX = curr;
    if (!curr.nulled) {
      func(curr.val);
    }
  }
}

async function collect<T>(gen, modifiers, n: number) {
  const arr: T[] = [];
  let i = n;
  let prevX: AggVal<null> | AggVal<T> = {
    val: null,
    nulled: false,
    props: {}
  };
  for await (const x of gen) {
    const curr = calc(x, modifiers, prevX).value as AggVal<T>;
    prevX = curr;

    if (!curr.nulled) {
      arr.push(curr.val);
      if (--i <= 0) break;
    }
  }
  return arr;
}

const Value = <T>(value: AggVal<T>) => ({
  value,
  retain: !value.nulled,
  map: <S>(
    func: (x: AggVal<T>, prevVal: AggVal<T>) => AggVal<S>,
    prevVal: AggVal<T>
  ) =>
    value.nulled
      ? Value({...prevVal, nulled: true})
      : Value(func(value, prevVal))
});
