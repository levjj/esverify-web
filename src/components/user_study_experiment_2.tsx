import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyExperiment2 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDE state={state} dispatch={dispatch} enableDebugger={false} enableExampleSelect={false}
           enableSourceAnnotations={false} enableVCPanel={false} enableVerification={true}
           large={false} enableRunning={false} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>Experiment 2: Dice Rolls</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>This experiment involves an function for rolling a six-sided dice.</p>
              <p>A correct implementation is given and the following assertions should be verifiable
                 but the postconditions are missing.</p>
              <p>The verification inspector is not available.</p>
              <p>Click 'Next' if you fixed the example or if you want to move to the next experiment.</p>
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
            <div className='card-title h5'>Experiment 2: Dice Rolls</div>
          </div>
          <div className='card-body'>
            <ol>
              <li>
                Add missing postconditions with <code>ensures(res => ...);</code> in order to verify the assertions.
              </li>
              <li>You can verify code but there is no verification inspector.</li>
              <li>Click 'Next' if you fixed the example or if you want to move to the next experiment.</li>
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
