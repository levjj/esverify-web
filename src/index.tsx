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
  if (window.location.pathname.endsWith('/idembed')) {
    const searchParams = new URLSearchParams(window.location.search);
    const heightParam = searchParams.get('height');
    const height = heightParam === null ? 10 : +heightParam;
    const debug = searchParams.has('debugger');
    const popups = searchParams.has('popups');
    const vcpanel = searchParams.has('panel');
    const run = searchParams.has('run');
    ReactDOM.render(
      <IDVE state={state} dispatch={dispatch} enableDebugger={debug} enableExampleSelect={false}
           enableSourceAnnotations={popups} enableVCPanel={vcpanel} enableVerification={true}
           enableTitle={false} large={false} enableRunning={run} height={height} />,
      document.getElementById('root')
    );
  } else if (window.location.pathname.endsWith('/idve')) {
    ReactDOM.render(
      <IDVE state={state} dispatch={dispatch} enableDebugger={true} enableExampleSelect={true}
           enableSourceAnnotations={true} enableVCPanel={true} enableVerification={true}
           enableTitle={true} height={undefined} large={true} enableRunning={true} />,
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
    const searchParams = new URLSearchParams(window.location.search);
    const heightParam = searchParams.get('height');
    const height = heightParam === null ? 10 : +heightParam;
    ReactDOM.render(
      <Embed state={state} dispatch={dispatch} height={height}
             enableRunning={searchParams.has('run')} enableVerification={searchParams.has('verify')} />,
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
