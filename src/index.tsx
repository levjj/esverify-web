import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AppState, Action, reduce, initialState, init } from './app';
import Embed from './components/embed';
import IDVE from './components/idve';
import Try from './components/try';
import UserStudySteps from './components/user_study_steps';
import UserStudy from './components/user_study';

let state: AppState = initialState();
let renderRequested: boolean = false;

function dispatch (action: Action) {
  if (action.type === 'ASYNCHRONOUS') {
    dispatch(action.start);
    action.end.then(dispatch);
  } else {
    state = reduce(state, action);
    if (!renderRequested) {
      renderRequested = true;
      setTimeout(render, 0);
    }
  }
}

function render () {
  if (window.location.pathname.endsWith('/idve')) {
    ReactDOM.render(
      <IDVE state={state} dispatch={dispatch} enableDebugger={true} enableExampleSelect={true}
           enableSourceAnnotations={true} enableVCPanel={true} enableVerification={true}
           large={true} enableRunning={true} />,
      document.getElementById('root')
    );
  } else if (window.location.pathname.endsWith('/userstudy-experiments')) {
    ReactDOM.render(
      <UserStudySteps step={state.userStudy.currentStep} />,
      document.getElementById('userstudy-steps')
    );
    ReactDOM.render(
      <UserStudy state={state} dispatch={dispatch} />,
      document.getElementById('root')
    );
  } else if (window.location.pathname.endsWith('/embed')) {
    ReactDOM.render(
      <Embed state={state} dispatch={dispatch} />,
      document.getElementById('root')
    );
  } else {
    ReactDOM.render(
      <Try state={state} dispatch={dispatch} />,
      document.getElementById('root')
    );
  }
  renderRequested = false;
}

init();
render();
