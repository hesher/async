import {AggVal} from './AggVal';

export const doModifier = (func: Function) => <T>(curr: AggVal<T>) => {
  func(curr.val);
  return curr;
};
