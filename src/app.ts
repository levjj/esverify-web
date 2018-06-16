import { Message, verify as startVerification } from 'esverify';

import { ExampleName, getExample, getExampleNames } from './examples';

export interface SelectExample {
  type: 'SELECT_EXAMPLE';
  selected: ExampleName;
}

export interface ChangeSource {
  type: 'CHANGE_SOURCE';
  newSource: string;
}

export interface Verify {
  type: 'VERIFY';
}

export interface VerificationDone {
  type: 'VERIFICATION_DONE';
  sourceCode: string;
  result: Array<Message>;
}

export interface VerificationError {
  type: 'VERIFICATION_ERROR';
}

export interface AsynchrousAction {
  type: 'ASYNCHRONOUS';
  start: BaseAction;
  end: Promise<Action>;
}

export type BaseAction = SelectExample | ChangeSource | Verify | VerificationDone | VerificationError;
export type Action = BaseAction | AsynchrousAction;

export function selectExample (example: ExampleName): AsynchrousAction {
  return {
    type: 'ASYNCHRONOUS',
    start: { type: 'SELECT_EXAMPLE', selected: example },
    end: new Promise(resolve => {
      setTimeout(() => resolve(verify(getExample(example).source)), 300);
    })
  };
}

export function verify (sourceCode: string): AsynchrousAction {
  return {
    type: 'ASYNCHRONOUS',
    start: { type: 'VERIFY' },
    end: startVerification(sourceCode, { remote: true, z3url: '/z3' })
      .then((result): VerificationDone => ({ type: 'VERIFICATION_DONE', sourceCode, result }))
      .catch((): VerificationError => ({ type: 'VERIFICATION_ERROR' }))
  };
}

export interface AppState {
  selected: ExampleName;
  sourceCode: string;
  verificationProcess: 'done' | 'inprogress' | 'error';
  messages: Array<Message>;
}

export function initialState (): AppState {
  let initialExample = getExampleNames()[8];
  if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#max') {
    initialExample = getExampleNames().find(name => name === window.location.hash.substr(1)) || initialExample;
  }
  return {
    selected: initialExample,
    sourceCode: getExample(initialExample).source,
    verificationProcess: 'done',
    messages: []
  };
}

export function reduce (state: AppState, action: BaseAction): AppState {
  switch (action.type) {
    case 'SELECT_EXAMPLE':
      const { selected } = action;
      return { ...state, selected, sourceCode: getExample(selected).source, messages: [], verificationProcess: 'done' };
    case 'CHANGE_SOURCE':
      const { newSource } = action;
      return { ...state, sourceCode: newSource, messages: [], verificationProcess: 'done' };
    case 'VERIFY':
      return { ...state, verificationProcess: 'inprogress' };
    case 'VERIFICATION_DONE':
      const { sourceCode, result } = action;
      if (sourceCode !== state.sourceCode) return state; // ignore outdated requests
      return { ...state, verificationProcess: 'done', messages: result };
    case 'VERIFICATION_ERROR':
      return { ...state, verificationProcess: 'error', messages: [] };
  }
}
