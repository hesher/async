import {AggVal} from './AggVal';

export const throttleByTime = (delta: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<T>
): AggVal<T> => {
  const now = Date.now();
  console.log('prev=', prev);
  const prev = prev.props.timestamp || 0;
  console.log('delta=', now - prev);
  if (now - prev < delta) {
    return {...curr, nulled: true};
  } else {
    return {...curr, props: {...curr.props, timestamp: now}};
  }
};
