import * as React from 'react';
import { AppState, Action } from '../app';
import IDVE from './idve';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyExperiment1 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDVE state={state} dispatch={dispatch} enableDebugger={true} enableExampleSelect={false}
           enableSourceAnnotations={false} enableVCPanel={true} enableVerification={true}
           large={false} enableRunning={false} enableTitle={true} height={undefined} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>Experiment 1: Factorial</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>This first experiment involves an incorrect factorial function.</p>
              <p>This example can either be fixed by adding a stronger precondition or
                 by changing the <code>if</code> statement.</p>
              <p>You can use verification inspector and the integrated counterexample debugger.</p>
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
            <div className='card-title h5'>Experiment 1: Factorial</div>
          </div>
          <div className='card-body'>
            <ol>
              <li>This example can either be fixed by adding a stronger precondition or
                 by changing the <code>if</code> statement.</li>
              <li>You can use verification inspector and the integrated counterexample debugger.</li>
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
