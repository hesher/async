// import {AggVal} from './AggVal';
// export const buffer = (ms: number) => <T>(
//   curr: AggVal<T>,
//   prev: AggVal<any>
// ): AggVal<any> => {
//   const timeOfPrev = prev.props.startBufferTime || 0;
//   const now = new Date().getTime();
//   const delta = now - timeOfPrev;
//   // return {
//   //   ...curr,
//   //   nulled: !isFull,
//   //   props: {...curr.props, buffering: isFull ? 0 : buff + 1},
//   //   val: [...(isNew ? [] : prev.val), curr.val]
//   // };
//   const buff = prev.props['timeBuffering'] || 0;
//   const isFull = buff === size - 1;
//   const isNew = buff === 0;
//     return  {
//         ...curr,
//         nulled: delta < ms,
//         val: [...(!prev.props. ? [] : )]
//         props: {...curr.props, time: now}
//       }
// }
