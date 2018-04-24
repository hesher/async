# async

This library allows you wrap async generators and consume it using functional methods.
For example:

```javascript
import {wrap} from './async';

// genNums(9) is an async generator that yields 9 numbers (0 to 8),
// a number is generated every few ms
// checkout implementation in tests

it('should allow to buffer', async () => {
  expect(
    await wrap(genNums(9))
      .filter(x => x % 2 === 0)
      .buffer(2)
      .take(2)
  ).toEqual([[0, 2], [4, 6]]);
});
```

## Installation

```console
npm install
```

Install all dependencies

## Testing

```console
npm run test
```

This will watch for changes and run the relevant tests after every change in code

## Running

```console
npm run start
```

This will open the browser and start to watch for changes, auto reloading with each change
