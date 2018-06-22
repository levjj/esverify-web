import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyTutorial2 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDE state={state} dispatch={dispatch} enableDebugger={false} enableExampleSelect={false}
           enableSourceAnnotations={false} enableVCPanel={false} enableVerification={true}
           large={false} enableRunning={true} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>Program Verification With Pre- and Postconditions</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p><code>esverify</code> extends JavaScript with special syntax to annotate functions with
                  pre- and postconditions.</p>
              <p>These are written as pseudo function calls that are skipped during evaluation.</p>
              <p>The following example includes an incorrect <code>max</code> function that
                 should be fixed such that it returns the maximum of its arguments and verification succeeds.
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
            <div className='card-title h5'>Program Verification With Pre- and Postconditions</div>
            <div className='card-subtitle text-gray'>
              Verify the given annotated <code>max</code> function and fix potential issues.
            </div>
          </div>
          <div className='card-body'>
            <ol>
              <li>Click the <span className='label label-primary'>verify</span> button to
                  verify all assertions in the code.</li>
              <li>The second postcondition does not hold due to a bug in the implementation.</li>
              <li>Change the source code to return the correct maximum of <code>a</code> and <code>b</code>.</li>
              <li>Click the <span className='label label-primary'>verify</span> button
                  again to ensure that the new code verifies.</li>
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
