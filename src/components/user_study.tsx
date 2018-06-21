import * as React from 'react';
import { AppState, Action, UserStudyStep } from '../app';
import UserStudyTutorial1 from './user_study_tutorial_1';
import UserStudyExperiment1 from './user_study_experiment_1';
import UserStudySurvey from './user_study_survey';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudy ({ state, dispatch }: Props) {
  if (state.userStudy.currentStep === UserStudyStep.TUTORIAL) {
    return (<UserStudyTutorial1 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.EXPERIMENTS) {
    return (<UserStudyExperiment1 state={state} dispatch={dispatch} />);
  } else {
    return (<UserStudySurvey state={state} />);
  }
}
