import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyTutorial4 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDE state={state} dispatch={dispatch} enableDebugger={true} enableExampleSelect={false}
           enableSourceAnnotations={false} enableVCPanel={true} enableVerification={true}
           large={false} enableRunning={false} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>Verification and Debugger Integration</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>
                For each unverified verification condition, the counterexample values can be used
                to execute the code with an interactive debugger.
              </p>
              <p>
                The debugger shows variables in scope, the current call stack and allows step-by-step debugging.
              </p>
              <p>
                Additionally, the debugger can be queried with watch expressions.
              </p>
            </div>
          </div>
          <div className='modal-footer'>
            <p className='text-center'>
              <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
                href='#' className='btn btn-lg btn-primary' aria-label='Close'>Start</a>
            </p>
          </div>
        </div>
      </div>
      <div className='userstudy-helper'>
        <div className='card'>
          <div className='card-header'>
            <div className='card-title h5'>Verification and Debugger Integration</div>
            <div className='card-subtitle text-gray'>
              Query the counterexample and step through the code.
            </div>
          </div>
          <div className='card-body'>
            <ol>
              <li>Click the <span className='label label-primary'>verify</span> button
                  to verify all assertions in the code.</li>
              <li>Click on the first incorrect verification condition in line 6.</li>
              <li>The verification inspector in the panel on the right lists watch expressions,
                  variables in scope and the call stack.</li>
              <li>In this case, the counterexample uses <code>0</code> for both <code>a</code> and <code>b</code>.</li>
              <li>To query the return value, enter <code>res</code> next to 'Watch:'.</li>
              <li>It seems the function returns <code>undefined</code>.</li>
              <li>To see the control flow, step through the code by clicking
                  <span className='label label-primary'>Restart</span> and then
                  clicking <span className='label label-primary'>Step Into</span> about nine times.</li>
              <li>It seems none of the two <code>if</code> statements returned a value.</li>
            </ol>
          </div>
          <div className='card-footer clearfix'>
            <button className='btn btn-primary float-right'
                    onClick={() => dispatch({ type: 'USER_STUDY_NEXT' })}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
