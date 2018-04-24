import {AggVal} from './AggVal';
export const buffer = (size: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<any>
): AggVal<any> => {
  const buff = prev.props['buffering'] || 0;
  return {
    ...curr,
    nulled: buff === size - 1 ? curr.nulled : true,
    props: {...curr.props, buffering: buff === size - 1 ? 0 : buff + 1},
    val: [...(buff === 0 ? [] : prev.val), curr.val]
  };
};
