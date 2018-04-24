import {AggVal} from './AggVal';

export const throttle = (n: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<T>
): AggVal<T> => {
  const ret = curr.nulled
    ? curr
    : prev.props.skipped < n && prev.props.skipped >= 0
      ? {
          ...curr,
          nulled: true,
          props: {...curr.props, skipped: prev.props.skipped + 1}
        }
      : {...curr, props: {...curr.props, skipped: 0}};
  return ret;
};
