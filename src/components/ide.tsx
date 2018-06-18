import React = require('react');
import { AppState, Action, verify } from '../app';
import ExampleDropDown from './example_dropdown';
import Editor from './editor';
import { Message } from 'esverify';
import { Annotation } from 'react-ace';
import SplitPane from 'react-split-pane';

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

function messageText (msg: Message): string {
  switch (msg.status) {
    case 'verified':
      return `verified: ${msg.description}`;
    case 'unverified':
    case 'unknown':
      return `${msg.status}: ${msg.description}`;
    case 'error':
      return `error: ${msg.type} ${msg.description}`;
    case 'timeout':
      return `timeout: ${msg.description}`;
  }
}

function messageAsAnnotation (msg: Message): Annotation {
  return {
    row: Math.max(0, msg.loc.start.line - 1),
    column: msg.loc.start.column,
    text: messageText(msg),
    type: messageType(msg)
  };
}

export default function component ({ state, dispatch }: Props) {
  return (
    <SplitPane split='vertical' defaultSize='75%' className='container grid-xl' style={{ height: '80vh' }}>
      <div>
        <div className='p-2'>
          <div className='float-right'>
            <ExampleDropDown selected={state.selected} dispatch={dispatch} />
            {' '}
            <button
              className={(state.verificationProcess === 'inprogress' ? 'loading ' : '') + 'btn btn-primary'}
              onClick={() => dispatch(verify(state.sourceCode))}>verify</button>
          </div>
          <h4>Interactive Verification Environment</h4>
        </div>
        <div className='divider'></div>
        <Editor
          annotations={state.messages.map(messageAsAnnotation)}
          selectedLine={state.selectedLine}
          sourceCode={state.sourceCode}
          dispatch={dispatch} />
      </div>
      <div>
        Side Panel
      </div>
    </SplitPane>
  );
}
