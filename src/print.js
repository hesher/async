export default function printMe() {
  console.log('I get called from print.js!');
}

export function unusedShit() {
  console.log('whaever');
}

// var map = transform => x => transform(x);
// var filter = predicate => x => (predicate(x) ? x : null);

// function wrap(asyncGen, modifiers = []) {
//   return {
//     asyncGen,
//     map: transform => wrap(asyncGen, [...modifiers, map(transform)]),
//     take: n => collect(asyncGen, modifiers, n),
//     filter: predicate => wrap(asyncGen, [...modifiers, filter(predicate)]),
//     forEach: func => act(asyncGen, modifiers, func)
//   };
// }

// async function collect(gen, modifiers, n) {
//   const arr = [];
//   let i = n;
//   for await (let x of gen) {
//     const val = calc(x, modifiers);
//     if (val !== null) {
//       arr.push(val);
//       if (--i <= 0) break;
//     }
//   }
//   return arr;
// }

// var Value = (value, isNull = value === null) => ({
//   value,
//   map: func => (isNull ? Value(value) : Value(func(value)))
// });

// var calc = (x, modifiers) => {
//   return modifiers.reduce(
//     (val, currModifier) => val.map(currModifier),
//     Value(x)
//   ).value;
// };

// async function act(gen, modifiers, func) {
//   for await (let x of gen) {
//     const val = calc(x, modifiers);
//     if (val !== null) {
//       func(val);
//     }
//   }
// }

// // demo
var timer = (time = 500) =>
  new Promise(resolve => setTimeout(() => resolve(), time));
async function* genNums(n = 999) {
  for (let i = 0; i < n; i++) {
    yield timer(100).then(() => i);
  }
}

// wrap(genNums()) // [0, 1, 2,…]
//   .map(x => x + 1) // [1, 2, 3,…]
//   .filter(x => x > 2) // [2, 4, 6,…]
//   .map(x => x * x)
//   .filter(x => x % 7 === 0)
//   .take(3)
//   .then(x => console.log(x));
