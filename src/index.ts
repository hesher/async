import './style.css';
import {factory} from './async';
import {onEvent} from './onEvent';
import {timeThrottleConfig} from './timeThrottle';
import {throttle} from './throttle';

function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click My Right Side';
  const myWrap: any = factory().addModifier(timeThrottleConfig).wrap;
  myWrap(onEvent('click', btn))
    .map(ev => ({
      clickXRelButton: ev.screenX - ev.target.offsetLeft,
      buttonWidth: ev.target.clientWidth
    }))
    // .timeThrottle(100)
    .do(({clickXRelButton, buttonWidth}) => {
      if (clickXRelButton <= buttonWidth / 2) {
        console.log('Thats my left side');
      }
    })
    .filter(
      ({clickXRelButton, buttonWidth}) => clickXRelButton > buttonWidth / 2
    )
    .map(() => Date.now())
    .buffer(3)
    .forEach(ev => {
      console.log(`Average time between clicks:`, (ev[2] - ev[0]) / 2);
    });

  element.innerHTML = `
  <h1>The Async App!</h1>
  <h3>Click the button's right side 3 times to see the click array</h3>
  <h4>Not too fast, though</h4>
  `;
  element.classList.add('hello');
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
