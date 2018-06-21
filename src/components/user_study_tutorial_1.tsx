import * as React from 'react';
import { AppState, Action } from '../app';
import IDE from './ide';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyTutorial1 ({ state, dispatch }: Props) {
  return (
    <div>
      <IDE state={state} dispatch={dispatch} enableDebugger={false} enableExampleSelect={false}
           enableSourceAnnotations={false} enableVCPanel={false} enableVerification={false}
           large={false} />
      <div className={state.userStudy.showModal ? 'modal active' : 'modal'}>
        <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
           href='#'className='modal-overlay' aria-label='Close'>
        </a>
        <div className='modal-container'>
          <div className='modal-header'>
            <a onClick={e => { e.preventDefault(); dispatch({ type: 'USER_STUDY_CLOSE_MODAL' }); }}
               href='#' className='btn btn-clear float-right' aria-label='Close'></a>
            <div className='modal-title h5'>JavaScript Live Editing</div>
          </div>
          <div className='modal-body'>
            <div className='content'>
              <p>This user study involves interactions with a programming environments.</p>
              <p>The source code can be edited direclty and the resulting program evaluated.</p>
              <p>Test the editor by fixing the JavaScript program such that it computes the correct
                 area of a rectangle.</p>
            </div>
          </div>
        </div>
      </div>
      <div className='userstudy-helper'>
        <div className='card'>
          <div className='card-header'>
            <div className='card-title h5'>JavaScript Live Editing</div>
            <div className='card-subtitle text-gray'>
              Edit and run a simple JavaScript program
            </div>
          </div>
          <div className='card-body'>
            <ol>
              <li>Change the source code to compute the correct area of an rectangle.</li>
              <li>Click the 'run' button to test the code.</li>
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
