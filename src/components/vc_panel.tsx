import React = require('react');
import { Action, InteractiveVC, addAssertion, removeAssumption, addAssumption } from '../app';
import { VerificationCondition, formatMessage } from 'esverify';

export interface Props {
  verificationCondition: InteractiveVC;
  dispatch: (action: Action) => void;
}

function panelTitle (verificationCondition: VerificationCondition) {
  const result = verificationCondition.getResult();
  if (result !== null) {
    return <span dangerouslySetInnerHTML={{ __html: formatMessage(result, false) }} />;
  } else {
    return <span><b>inprogress:</b> {verificationCondition.getDescription()}</span>;
  }
}

export default function component ({ verificationCondition, dispatch }: Props) {
  return (
    <div className='panel-body'>
      <ul className='plist'>
        <li className='divider' data-content='ASSUMPTIONS'></li>
        {verificationCondition.vc.getAssumptions().map((assumption, index) => (
          <li className='plist-item' key={index}>
            <div className='plist-badge'>
              <button className='btn btn-clear'
                      onClick={() => dispatch(removeAssumption(verificationCondition, index))}>
              </button>
            </div>
            <div className='plist-elem'>
              {assumption}
            </div>
          </li>
        ))}
      </ul>
      <form className='form-horizontal'
            onSubmit={e => { e.preventDefault(); dispatch(addAssumption(verificationCondition)); }}>
        <div
          className={verificationCondition.inputAssumptionError === undefined ? 'form-group' : 'form-group has-error'}>
          <div className='col-2 col-sm-12'>
            <label className='form-label' htmlFor='addAssumption'>Assume:</label>
          </div>
          <div className='col-10 col-sm-12'>
            <input className='form-input codeinput' type='text' id='addAssumption' placeholder='x > 1'
                   onChange={e => dispatch({ type: 'INPUT_ASSUMPTION', source: e.target.value })} />
            {verificationCondition.inputAssumptionError === undefined ? '' :
              (<p className='form-input-hint'>{verificationCondition.inputAssumptionError}</p>) }
          </div>
        </div>
      </form>
      <ul className='plist'>
        <li className='divider' data-content='ASSERTIONS'></li>
        <li className='plist-item'>
          <a href='#'
             className={verificationCondition.selectedAssertion === undefined ? 'active' : ''}
             onClick={e => { e.preventDefault(); dispatch({ type: 'SELECT_ASSERTION', selected: undefined }); }}>
            {panelTitle(verificationCondition.vc)}
          </a>
        </li>
        {verificationCondition.otherAssertions.map((vc, index) => (
          <li className='plist-item' key={index}>
            <div className='plist-badge'>
              <button className='btn btn-clear' onClick={() => dispatch({ type: 'REMOVE_ASSERTION', index })}></button>
            </div>
            <a href='#'
               className={verificationCondition.selectedAssertion === index ? 'active' : ''}
               onClick={e => { e.preventDefault(); dispatch({ type: 'SELECT_ASSERTION', selected: index }); }}>
              {panelTitle(vc)}
            </a>
          </li>
        ))}
      </ul>
      <form className='form-horizontal'
            onSubmit={e => { e.preventDefault(); dispatch(addAssertion(verificationCondition)); }}>
        <div
          className={verificationCondition.inputAssertionError === undefined ? 'form-group' : 'form-group has-error'}>
          <div className='col-2 col-sm-12'>
            <label className='form-label' htmlFor='addAssertion'>Assert:</label>
          </div>
          <div className='col-10 col-sm-12'>
            <input className='form-input codeinput' type='text' id='addAssertion' placeholder='x > 1'
                   onChange={e => dispatch({ type: 'INPUT_ASSERTION', source: e.target.value })} />
            {verificationCondition.inputAssertionError === undefined ? '' :
              (<p className='form-input-hint'>{verificationCondition.inputAssertionError}</p>) }
          </div>
        </div>
      </form>
    </div>
  );
}
