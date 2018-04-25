import {wrap} from './async';
const timer = (time = 500) =>
  new Promise(resolve => setTimeout(() => resolve(), time));
async function* genNums(n = 9999, interval = 1) {
  for (let i = 0; i < n; i++) {
    yield timer(interval).then(() => i);
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

  it.only('should allow to buffer', async () => {
    expect(
      await wrap(genNums(9, 20))
        .throttleByTime(50)
        .take(3)
    ).toEqual([0, 3, 6]);
  });
});
