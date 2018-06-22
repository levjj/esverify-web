import * as React from 'react';
import { AppState, Action, UserStudyStep } from '../app';
import UserStudyTutorial1 from './user_study_tutorial_1';
import UserStudyTutorial2 from './user_study_tutorial_2';
import UserStudyTutorial3 from './user_study_tutorial_3';
import UserStudyTutorial4 from './user_study_tutorial_4';
import UserStudyExperiment1 from './user_study_experiment_1';
import UserStudyExperiment2 from './user_study_experiment_2';
import UserStudyExperiment3 from './user_study_experiment_3';
import UserStudySurvey from './user_study_survey';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

export default function UserStudy ({ state, dispatch }: Props) {
  if (state.userStudy.currentStep === UserStudyStep.TUTORIAL_1) {
    return (<UserStudyTutorial1 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.TUTORIAL_2) {
    return (<UserStudyTutorial2 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.TUTORIAL_3) {
    return (<UserStudyTutorial3 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.TUTORIAL_4) {
    return (<UserStudyTutorial4 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.EXPERIMENT_1) {
    return (<UserStudyExperiment1 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.EXPERIMENT_2) {
    return (<UserStudyExperiment2 state={state} dispatch={dispatch} />);
  } else if (state.userStudy.currentStep === UserStudyStep.EXPERIMENT_3) {
    return (<UserStudyExperiment3 state={state} dispatch={dispatch} />);
  } else {
    return (<UserStudySurvey state={state} />);
  }
}
