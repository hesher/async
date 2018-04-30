import {AggVal} from './AggVal';
import {factory} from './async';

const Null = <T>(x): AggVal<null> => ({
  ...x,
  nulled: true
});

const timeThrottle = (ms: number) => <T>(curr: AggVal<T>, prev: AggVal<T>) => {
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

export const timeThrottleConfig = {
  name: 'timeThrottle',
  modifier: timeThrottle
};

// factory().addModifier({ name: 'timeThrottle', modifier: timeThrottle });{ name: 'timeThrottle', modifier: timeThrottle }
