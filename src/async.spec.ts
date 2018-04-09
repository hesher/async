import {wrap} from './async';
var timer = (time = 500) =>
  new Promise(resolve => setTimeout(() => resolve(), time));
async function* genNums(n = 9999) {
  for (let i = 0; i < n; i++) {
    yield timer(1).then(() => i);
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
});
