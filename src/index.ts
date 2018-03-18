import './style.css';
import {wrap, on} from './async';

function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click Me Mon frere';
  wrap(on('mouseenter', btn)).forEach(ev => console.log('BOOM!!!', ev.target));

  element.innerHTML = 'The Async App!';
  element.classList.add('hello');
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
