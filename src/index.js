import _ from 'lodash';
import './style.css';
import printMe from './print';
import {wrap} from './print';

async function* onClick(element) {
  const listeners = [];
  element.addEventListener('click', ev => {
    listeners.forEach(listener => listener(ev));
    listeners.length = 0;
  });
  while (true) {
    yield new Promise(resolve => listeners.push(ev => resolve(ev)));
  }
}

function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click Me Mon frere';
  wrap(onClick(btn)).forEach(ev => console.log('BOOM!!!', ev.target));

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.classList.add('hello');
  element.appendChild(btn);

  return element;
}

document.body.appendChild(component());
