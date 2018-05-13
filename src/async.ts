import {AggVal} from './AggVal';
import {buffer} from './buffer';
import {throttle} from './throttle';
import {doModifier} from './do';
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

// let wrap = factory().addModifier({ 'timeThrottle', timeThrottle }).wrap;
type ModifierConfig = {name: string; modifier: Function};
type FactoryParams = {addedModifiers: ModifierConfig[]};
export const factory = (modifiers: Array<ModifierConfig> = []) => ({
  addModifier: modifier => factory([...modifiers, modifier]),
  wrap: (asyncGen, pModifiers?, params: FactoryParams = {addedModifiers: []}) =>
    wrap(asyncGen, pModifiers, {
      ...params,
      addedModifiers: [...(params && params.addedModifiers), ...modifiers]
    })
});
export function wrap<T, S>(
  asyncGen: AsyncIterableIterator<T>,
  modifiers: Array<
    (x: AggVal<T>, prev: AggVal<T>) => AggVal<S> | AggVal<T>
  > = [],
  {addedModifiers = []}: {addedModifiers?: ModifierConfig[]} = {}
) {
  const props = {addedModifiers};
  return {
    asyncGen,
    ...addedModifiers,
    //modifiers
    map: transform => wrap(asyncGen, [...modifiers, map(transform)], props),
    do: func => wrap(asyncGen, [...modifiers, doModifier(func)], props),
    filter: predicate =>
      wrap(asyncGen, [...modifiers, filter(predicate)], props),
    throttle: (time: number) =>
      wrap(asyncGen, [...modifiers, throttle(time)], props),
    buffer: (size: number) =>
      wrap(asyncGen, [...modifiers, buffer(size)], props),
    ...addedModifiers.reduce(
      (acc, curr) => ({
        [curr.name]: (...args) =>
          wrap(asyncGen, [...modifiers, curr.modifier(args)], props)
      }),
      {}
    ),
    // consumber
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
