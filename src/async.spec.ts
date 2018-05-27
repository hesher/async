import {wrap, factory} from './async';
import {timeThrottleConfig} from './timeThrottle';
import {AggVal} from './AggVal';
const timer = (time = 500) =>
  new Promise(resolve => setTimeout(() => resolve(), time));

async function* genNums(n = 9999, {delta = 1} = {}) {
  for (let i = 0; i < n; i++) {
    yield timer(delta).then(() => i);
  }
}

async function* genInterval(clicks: number[]) {
  let lastClickTS = 0;
  for (const clickTS of clicks) {
    await timer(clickTS - lastClickTS);
    yield clickTS;
    lastClickTS = clickTS;
  }
}

describe('async', () => {
  it('should allow to map, filter and take', async () => {
    const observer = wrap(genNums())
      .map(x => x * 2)
      .filter(x => x > 0)
      .take(3);
    expect(await observer).toEqual([2, 4, 6]);
  });

  it('should allow to map, filter and forEach', async () => {
    const acc: number[] = [];
    await wrap(genNums(5))
      .map(x => x * 2)
      .filter(x => x > 0)
      .forEach(x => acc.push(x));
    expect(acc).toEqual([2, 4, 6, 8]);
  });

  it('should allow to throttle', () => {
    const acc: number[] = [];
    return wrap(genNums(9))
      .throttle(2)
      .forEach(x => acc.push(x))
      .then(() => {
        expect(acc).toEqual([0, 3, 6]);
      });
  });
  it('should allow to buffer', async () => {
    expect(
      await wrap(genNums(9))
        .buffer(3)
        .take(3)
    ).toEqual([[0, 1, 2], [3, 4, 5], [6, 7, 8]]);
  });
  it('should allow to buffer', async () => {
    expect(
      await wrap(genNums(9))
        .filter(x => x % 2 === 0)
        .buffer(2)
        .take(2)
    ).toEqual([[0, 2], [4, 6]]);
  });

  it('should allow to time throttle', async () => {
    const myWrap: any = factory().addModifier(timeThrottleConfig).wrap;
    expect(
      await myWrap(genNums(4, {delta: 20}))
        .timeThrottle(50)
        .take(2)
    ).toEqual([0, 3]);
  });
  it('should allow to do', async () => {
    const buff: any[] = [];
    const result = await wrap(genNums(9))
      .do(x => buff.push(x))
      .take(5);

    expect(result).toEqual([0, 1, 2, 3, 4]);
    expect(buff).toEqual([0, 1, 2, 3, 4]);
  });

  it.only('should allow to buffer by time', async () => {
    const myWrap: any = factory().addModifier({
      name: 'timeBuffer',
      modifier: bufferTimeout => (curr: AggVal<any>, prev: AggVal<any>) => {
        console.log(`got ${curr.val}`);

        return curr;
      }
    }).wrap;

    expect(
      await myWrap(genInterval([1, 2, 3, 10, 11, 12]))
        .timeBuffer(3)
        .take(2)
    ).toEqual([[1, 2, 3], [10, 11, 12]]);
  });

  it('should allow to return promises from modifier', async () => {
    const myWrap: any = factory().addModifier({
      name: 'addOneFuture',
      modifier: () => (curr: AggVal<number>) =>
        Promise.resolve({...curr, val: curr.val + 1})
    }).wrap;

    expect(
      await myWrap(genNums())
        .addOneFuture()
        .addOneFuture()
        .addOneFuture()
        .take(3)
    ).toEqual([3, 4, 5]);
  });
});
