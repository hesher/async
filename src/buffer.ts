import {AggVal} from './AggVal';
export const buffer = (size: number) => <T>(
  curr: AggVal<T>,
  prev: AggVal<any>
): AggVal<any> => {
  let ret: AggVal<any>;
  const buff = prev.props['buffering'] || 0;
  if (buff === 0) {
    ret = {
      ...curr,
      nulled: true,
      props: {...curr.props, buffering: buff + 1},
      val: [curr.val]
    };
  } else if (buff < size - 1) {
    ret = {
      ...curr,
      nulled: true,
      props: {...curr.props, buffering: buff + 1},
      val: [...prev.val, curr.val]
    };
  } else {
    ret = {
      ...curr,
      props: {...curr.props, buffering: 0},
      val: [...prev.val, curr.val]
    };
  }

  return ret;
};
