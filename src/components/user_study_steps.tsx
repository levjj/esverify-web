import * as React from 'react';
import { UserStudyStep } from '../app';

export interface Props {
  step: UserStudyStep;
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
        <h5 style={{ width: '10rem' }}>User Study</h5>
        <ul className='step'>
          <li className='step-item'>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Explains the user study'>Introduction</a>
          </li>
          <li className='step-item'>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Informed consent Declaration'>Consent</a>
          </li>
          <li className={step === UserStudyStep.TUTORIAL ? 'step-item active' : 'step-item'}>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Short interactive Tutorial of esverify'>Tutorial</a>
          </li>
          <li className={step === UserStudyStep.EXPERIMENTS ? 'step-item active' : 'step-item'}>
            <a className='tooltip tooltip-bottom'
               data-tooltip='Programming tasks'>Experiments</a>
          </li>
          <li className={step === UserStudyStep.SURVEY ? 'step-item active' : 'step-item'}>
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
