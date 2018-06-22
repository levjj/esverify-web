import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyExperiment3 ({ state, dispatch }: Props) {
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
            <div className='modal-title h5'>Experiment 3: Digital 24 Hour Clock</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>Given the number of minutes until midnight,
                 you should return time in a 24-hour digital clock format.</p>
              <p>There are two bugs in provided example.</p>
              <p>You can use verification inspector and the editor counterexample popups.</p>
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
            <div className='card-title h5'>Experiment 3: Digital 24 Hour Clock</div>
          </div>
          <div className='card-body'>
            <ol>
              <li>There are two bugs in provided example.</li>
              <li>Change the precondition, the implementation or both.</li>
              <li>You can use verification inspector and the editor counterexample popups.</li>
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
