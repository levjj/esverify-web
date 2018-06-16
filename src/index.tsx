import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Try from './components/try';
import { AppState, Action, reduce, initialState } from './app';

let state: AppState = initialState();

function dispatch (action: Action) {
  if (action.type === 'ASYNCHRONOUS') {
    dispatch(action.start);
    action.end.then(dispatch);
  } else {
    state = reduce(state, action);
    setTimeout(render, 0);
  }
}

function render () {
  ReactDOM.render(
    <Try state={state} dispatch={dispatch} />,
    document.getElementById('root')
  );
}

render();
