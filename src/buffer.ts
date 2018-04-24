import {AggVal} from './AggVal';
export const buffer = (size: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<any>
): AggVal<any> => {
  const buff = prev.props['buffering'] || 0;
  const isFull = buff === size - 1;
  const isNew = buff === 0;
  return {
    ...curr,
    nulled: !isFull,
    props: {...curr.props, buffering: isFull ? 0 : buff + 1},
    val: [...(isNew ? [] : prev.val), curr.val]
  };
};
