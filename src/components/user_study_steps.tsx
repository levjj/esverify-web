import * as React from 'react';
import { UserStudyStep } from '../app';

export interface Props {
  step: UserStudyStep;
}

function isTutorial (step: UserStudyStep): boolean {
  return step === UserStudyStep.TUTORIAL_1 ||
         step === UserStudyStep.TUTORIAL_2 ||
         step === UserStudyStep.TUTORIAL_3 ||
         step === UserStudyStep.TUTORIAL_4;
}

function isExperiment (step: UserStudyStep): boolean {
  return step === UserStudyStep.EXPERIMENT_1 ||
         step === UserStudyStep.EXPERIMENT_2 ||
         step === UserStudyStep.EXPERIMENT_3;
}

function isSurvey (step: UserStudyStep): boolean {
  return step === UserStudyStep.SURVEY;
}

export default function UserStudySteps ({ step }: Props) {
  return (
    <nav className='navbar container grid-lg'>
      <div className='navbar-section'>
        <h1>
          <a href='/'>
            <img src='/logo.png' alt='esverify' />
          </a>
        </h1>
        <h5 style={{ width: '10rem' }}><a href='/userstudy'>User Study</a></h5>
        <ul className='step'>
          <li className='step-item'>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Explains the user study'>Introduction</a>
          </li>
          <li className='step-item'>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Informed consent Declaration'>Consent</a>
          </li>
          <li className={isTutorial(step) ? 'step-item active' : 'step-item'}>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Short interactive Tutorial of esverify'>Tutorial</a>
          </li>
          <li className={isExperiment(step) ? 'step-item active' : 'step-item'}>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Programming tasks'>Experiments</a>
          </li>
          <li className={isSurvey(step) ? 'step-item active' : 'step-item'}>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Questionnaire about programming with esverify'>Survey</a>
          </li>
          <li className='step-item'>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Thank you page with gift certificate raffle'>Finished</a>
          </li>
        </ul>
      </div>
      <div className='navbar-section'>
      </div>
    </nav>
  );
}
