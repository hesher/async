import {AggVal} from './AggVal';

const Null = <T>(x): AggVal<null> => ({
  ...x,
  nulled: true
});

export const timeThrottle = (ms: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<T>
) => {
  const timeOfPrev = prev.props.time || 0;
  const now = new Date().getTime();
  const delta = now - timeOfPrev;
  return delta > ms
    ? {
        ...curr,
        props: {...curr.props, time: now}
      }
    : {
        ...curr,
        nulled: true,
        props: {...curr.props, time: prev.props.time}
      };
};
