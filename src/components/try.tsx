import * as React from 'react';
import AceEditor, { Annotation } from 'react-ace';
import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/chrome';
import { Message, formatMessage } from 'esverify';
import { AppState, Action, verify, verificationInProgress, InteractiveVC } from '../app';
import ExampleDropDown from './example_dropdown';

export interface Props {
  state: AppState;
  dispatch: (action: Action) => void;
}

function messageType (msg: Message): 'info' | 'warning' | 'error' {
  switch (msg.status) {
    case 'verified': return 'info';
    case 'unverified': return 'warning';
    case 'timeout': return 'warning';
  }
  return 'error';
}

function messageAsAnnotation (msg: Message): Annotation {
  return {
    row: Math.max(0, msg.loc.start.line - 1),
    column: msg.loc.start.column,
    // @ts-ignore use 'html' annotation instead of 'text'
    html: formatMessage(msg, false),
    type: messageType(msg)
  };
}

function vcAsAnnotation (vc: InteractiveVC): Annotation {
  const res = vc.vc.getResult();
  if (res === null) {
    return {
      row: Math.max(0, vc.vc.getLocation().start.line - 1),
      column: vc.vc.getLocation().start.column,
      // @ts-ignore use 'html' annotation instead of 'text'
      html: '<b>loading...</b>',
      type: 'warning'
    };
  } else {
    return messageAsAnnotation(res);
  }
}

export default function Try ({ state, dispatch }: Props) {
  const annotations: Array<Annotation> = state.message !== undefined
    ? [messageAsAnnotation(state.message)]
    : state.vcs.map(vcAsAnnotation);
  return (
    <div className='panel'>
      <div className='panel-header'>
        <div className='panel-title'>
          <span className='h4'>Live Demo and Examples</span>
          <div className='float-right'>
            <ExampleDropDown selected={state.selected} dispatch={dispatch} />
            {' '}
            <button
              className={(verificationInProgress(state) ? 'loading ' : '') + 'btn btn-primary'}
              onClick={() => dispatch(verify(state.sourceCode))}>verify</button>
            {' '}
            <button
              className='btn btn-primary'
              onClick={() => dispatch({ type: 'RUN_CODE' })}>run</button>
          </div>
        </div>
      </div>
      <div className='panel-body'>
        <AceEditor
          style={{ width: '100%', height: '65vh' }}
          mode='javascript'
          theme='chrome'
          showPrintMargin={false}
          setOptions={{
            fontFamily: 'Fira Code',
            fontSize: '12pt'
          }}
          annotations={annotations}
          onChange={newSource => dispatch({ type: 'CHANGE_SOURCE', newSource })}
          value={state.sourceCode}
        />
      </div>
    </div>
  );
}
