import * as React from 'react';
import { AppState, Action } from '../app';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudyExperiment1 ({ dispatch }: Props) {
  return (
    <div>
      <button className='btn btn-primary float-right'
              onClick={() => dispatch({ type: 'USER_STUDY_NEXT' })}>
        Next
      </button>
      <h3>Tutorial Step 1: Basics</h3>
    </div>
  );
}
