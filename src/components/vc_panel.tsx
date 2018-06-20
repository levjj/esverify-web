import React = require('react');
import { Action, InteractiveVC, addAssertion, removeAssumption, addAssumption } from '../app';
import { VerificationCondition, formatMessage } from 'esverify';
import Inspector from './inspector';

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

const knownGlobals =
  ['Object', 'Function', 'Array', 'String', 'console', 'parseInt', 'Math', 'Number', 'assert', 'spec'];
function filterScopeEntries (varname: string, global: boolean): boolean {
  if (varname.startsWith('_') || varname.startsWith('old_')) return false;
  if (global && knownGlobals.indexOf(varname) >= 0) return false;
  return true;
}

export default function component ({ verificationCondition, dispatch }: Props) {
  const vc = verificationCondition.selectedAssertion === undefined
    ? verificationCondition.vc
    : verificationCondition.otherAssertions[verificationCondition.selectedAssertion];
  const scopes = vc.hasModel() && verificationCondition.selectedFrame !== undefined
    ? vc.getScopes(verificationCondition.selectedFrame) : undefined;
  return (
    <div className='panel-body'>
      <ul className='plist'>
        <li className='divider' data-content='ASSUMPTIONS'></li>
        {verificationCondition.vc.getAssumptions().map(([assumption, canBeDeleted], index) => (
          <li className='plist-item' key={index}>
            { canBeDeleted ? (<div className='plist-badge'>
              <button className='btn btn-clear'
                      onClick={() => dispatch(removeAssumption(verificationCondition, index))}>
              </button>
            </div>) : ''}
            <div className='plist-elem'>
              {assumption}
            </div>
          </li>
        ))}
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
      {!vc.hasModel() ? '' :
        <li className='divider' data-content='WATCH EXPRESSIONS'></li>}
      {!vc.hasModel() ? '' :
          vc.getWatches().map(([expression, dynamicValue, staticValue], index) => (
            <li className='plist-item clearfix' key={index}>
              <div className='plist-badge'>
                <button className='btn btn-clear' onClick={() => dispatch({ type: 'REMOVE_WATCH', index })} />
              </div>
              <div className='plist-elem'>
                <div className='float-left'>{expression}</div>
                <Inspector dynamicValue={dynamicValue} staticValue={staticValue} />
              </div>
            </li>
          ))}
      {!vc.hasModel() ? '' :
        <form className='form-horizontal'
              onSubmit={e => { e.preventDefault(); dispatch({ type: 'ADD_WATCH' }); }}>
          <div className='form-group'>
            <div className='col-2 col-sm-12'>
              <label className='form-label' htmlFor='addWatch'>Watch:</label>
            </div>
            <div className='col-10 col-sm-12'>
              <input className='form-input codeinput' type='text' id='addWatch' placeholder='x + y'
                    onChange={e => dispatch({ type: 'INPUT_WATCH', source: e.target.value })} />
            </div>
          </div>
        </form>}
      {scopes === undefined ? '' :
          <li className='divider' data-content='SCOPES' />}
      {scopes === undefined ? '' :
         scopes.map((scope, scopeIndex) =>
            scope
            .filter(([varname]) => filterScopeEntries(varname, scopeIndex === scopes.length - 1))
            .map(([varname, dynamicValue, staticValue], index) => (
              <li className='plist-item clearfix' key={scopeIndex + 'scope' + index}>
                <div className='plist-elem'>
                  <div className='float-left'>{varname}</div>
                  <Inspector dynamicValue={dynamicValue} staticValue={staticValue} />
                </div>
              </li>
            ))
          )
          .reduce((prev, curr, scopeIndex): Array<JSX.Element> =>
            [...prev, <li className='divider' key={'div' + scopeIndex} />, ...curr])}
      {!vc.hasModel() ? '' :
          <li className='divider' data-content='CALL STACK'></li>}
      {!vc.hasModel() ? '' :
          vc.callstack().map(([description], index) => (
            <li className='plist-item' key={index}>
              <a href='#'
                className={verificationCondition.selectedFrame === index ? 'active' : ''}
                onClick={e => { e.preventDefault(); dispatch({ type: 'SELECT_FRAME', index }); }}>
                {description}
              </a>
            </li>
          )).reverse()}
        </ul>
      {!vc.hasModel() ? '' :
        <div>
          <br />
          <button className='btn btn-primary' onClick={() => dispatch({ type: 'RESTART_INTERPRETER' })}>
            Restart
          </button>{' '}
          <button className='btn btn-primary' onClick={() => dispatch({ type: 'STEP_INTO' })}>
            Step Into
          </button>{' '}
          <button className='btn btn-primary' onClick={() => dispatch({ type: 'STEP_OVER' })}>
            Step Over
          </button>{' '}
          <button className='btn btn-primary' onClick={() => dispatch({ type: 'STEP_OUT' })}>
            Step Out
          </button>
      </div>}
    </div>
  );
}
