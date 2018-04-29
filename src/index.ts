import './style.css';
import {wrap} from './async';
import {onEvent} from './onEvent';

function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click Me Bro';
  wrap(onEvent('click', btn))
    .timeThrottle(2000)
    .forEach(ev => {
      console.log('BOOM!!!', ev.target);
    });

  element.innerHTML = 'The Async App!';
  element.classList.add('hello');
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
