import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyTutorial3 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDE state={state} dispatch={dispatch} enableDebugger={false} enableExampleSelect={false}
           enableSourceAnnotations={true} enableVCPanel={true} enableVerification={true}
           large={false} enableRunning={false} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>Interactive Verification Condition Inspector</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>The following example includes a <code>max</code> function with missing preconditions.</p>
              <p>
                To better understand the problem, the <b>esverify</b> programming environment includes an interactive
                inspector for verification conditions that explains assumptions, assertions and counter examples
                if available.
              </p>
              <p>
                This inspector also allows interactively adding assumptions and assertions.
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
            <div className='card-title h5'>Interactive Verification Condition Inspector</div>
            <div className='card-subtitle text-gray'>
              Inspect a verification issue to understand and interactively explore assumptions and assertions.
            </div>
          </div>
          <div className='card-body'>
            <ol>
              <li>Click the <span className='label label-primary'>verify</span> button to
                  verify all assertions in the code.</li>
              <li>Click on the yellow triangle in front of line 4 to select the verification condition.</li>
              <li>The panel on the right lists assumptions and assertions and the editor shows
                  values for the counterexample as popup markers.</li>
              <li>
                According to the editor popups, the postcondition does not hold if the arguments are not numbers.
                Check this hypothesis by entering <code>typeof a === 'number'</code> next to 'Assume:'
                and confirm this with by pressing the enter/return key.
              </li>
              <li>
                Also add the assumption <code>typeof b === 'number'</code>.
              </li>
              <li>
                 With these assumptions, the postcondition can be verified.
              </li>
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
