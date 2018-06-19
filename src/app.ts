import { Message, setOptions, verificationConditions, VerificationCondition } from 'esverify';

import { ExampleName, getExample, getExampleNames } from './examples';

// --- state ---

export type InteractiveVC = Readonly<{
  vc: VerificationCondition;
  interpreted: boolean;
  otherAssertions: Array<VerificationCondition>;
  selectedAssertion: number | undefined;
  inputAssertion: string;
  inputAssertionError: string | undefined;
  inputAssumption: string;
  inputAssumptionError: string | undefined;
}>;

export type AppState = Readonly<{
  selected: ExampleName;
  selectedLine: number | undefined;
  sourceCode: string;
  message: Message | undefined;
  vcs: Array<InteractiveVC>;
  selectedVC: InteractiveVC | undefined;
  showSourceAnnotations: boolean;
}>;

export function verificationInProgress (state: AppState): boolean {
  return state.vcs.some(vc => vc.vc.getResult() === null);
}

export function currentVC (state: AppState | InteractiveVC): VerificationCondition {
  if ('vc' in state) {
    if (state.selectedAssertion === undefined) {
      return state.vc;
    } else {
      return state.otherAssertions[state.selectedAssertion];
    }
  } else {
    if (state.selectedVC === undefined) {
      throw new Error('no current VC');
    }
    return currentVC(state.selectedVC);
  }
}

export function availableVerificationConditions (state: AppState): Array<InteractiveVC> {
  if (state.selectedLine === undefined) return [];
  return state.vcs.filter((vc) => vc.vc.getLocation().start.line === state.selectedLine);
}

export function initialState (): AppState {
  let initialExample = getExampleNames()[8];
  if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#max') {
    initialExample = getExampleNames().find(name => name === window.location.hash.substr(1)) || initialExample;
  }
  return {
    selected: initialExample,
    selectedLine: undefined,
    sourceCode: getExample(initialExample).source,
    message: undefined,
    vcs: [],
    selectedVC: undefined,
    showSourceAnnotations: true
  };
}

function interpret (vc: InteractiveVC | undefined): InteractiveVC | undefined {
  if (vc === undefined) {
    return undefined;
  } else {
    if (!vc.interpreted && vc.vc.hasModel()) {
      vc.vc.runWithInterpreter();
      return {
        ...vc,
        interpreted: true
      };
    }
    return vc;
  }
}

// --- actions ---

export interface AsynchrousAction {
  type: 'ASYNCHRONOUS';
  start: BaseAction;
  end: Promise<Action>;
}

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
  vcs: Array<VerificationCondition>;
}

export interface VerificationDone {
  type: 'VERIFICATION_DONE';
}

export interface VerificationError {
  type: 'VERIFICATION_ERROR';
  message: Message;
}

export interface SelectLine {
  type: 'SELECT_LINE';
  line: number | undefined;
}

export interface SetSourceAnnotations {
  type: 'SET_SOURCE_ANNOTATIONS';
  enabled: boolean;
}

export interface SelectLine {
  type: 'SELECT_LINE';
  line: number | undefined;
}

export interface SelectVerificationCondition {
  type: 'SELECT_VC';
  selected: VerificationCondition;
}

export interface SelectAssertion {
  type: 'SELECT_ASSERTION';
  selected: number | undefined;
}

export interface RemoveAssertion {
  type: 'REMOVE_ASSERTION';
  index: number;
}

export interface InputAssertion {
  type: 'INPUT_ASSERTION';
  source: string;
}

export interface AddAssertion {
  type: 'ADD_ASSERTION';
  vc: VerificationCondition | string;
}

export interface InputAssumption {
  type: 'INPUT_ASSUMPTION';
  source: string;
}

export interface UpdateAssumptions {
  type: 'UPDATE_ASSUMPTIONS';
  error: string | undefined;
}

export type BaseAction = SelectExample
                       | ChangeSource
                       | Verify
                       | VerificationDone
                       | VerificationError
                       | SelectLine
                       | SelectVerificationCondition
                       | SetSourceAnnotations
                       | SelectAssertion
                       | RemoveAssertion
                       | InputAssertion
                       | AddAssertion
                       | InputAssumption
                       | UpdateAssumptions;
export type Action = BaseAction | AsynchrousAction;

// --- internal API ---

export function init (): void {
  setOptions({
    remote: true,
    z3url: '/z3',
    logformat: 'html'
  });
}

export function selectExample (example: ExampleName): Action {
  return {
    type: 'ASYNCHRONOUS',
    start: { type: 'SELECT_EXAMPLE', selected: example },
    end: new Promise(resolve => {
      setTimeout(() => resolve(verify(getExample(example).source)), 300);
    })
  };
}

async function verifyAll (vcs: Array<VerificationCondition>): Promise<Action> {
  if (vcs.length === 0) {
    return { type: 'VERIFICATION_DONE' };
  }
  const [vc, ...rest] = vcs;
  await vc.verify();
  return rest.length === 0 ? { type: 'VERIFICATION_DONE' } : {
    type: 'ASYNCHRONOUS',
    start: { type: 'VERIFICATION_DONE' },
    end: verifyAll(rest)
  };
}

export function verify (sourceCode: string): Action {
  const vcs = verificationConditions(sourceCode);
  if (vcs instanceof Array) {
    return {
      type: 'ASYNCHRONOUS',
      start: { type: 'VERIFY', vcs },
      end: verifyAll(vcs)
    };
  } else {
    return {
      type: 'VERIFICATION_ERROR',
      message: vcs
    };
  }
}

export function addAssertion (ivc: InteractiveVC): Action {
  try {
    const vc = ivc.vc.assert(ivc.inputAssertion);
    return {
      type: 'ASYNCHRONOUS',
      start: { type: 'ADD_ASSERTION', vc },
      end: vc.verify().then<Action>(() => {
        try {
          if (vc.hasModel()) vc.runWithInterpreter();
        } catch (e) { /* handle errors in panel */ }
        return { type: 'VERIFICATION_DONE' };
      })
    };
  } catch (e) {
    return {
      type: 'ADD_ASSERTION',
      vc: String(e)
    };
  }
}

async function verifyAndInterpretAll (vcs: Array<VerificationCondition>): Promise<Action> {
  if (vcs.length === 0) {
    return { type: 'VERIFICATION_DONE' };
  }
  const [vc, ...rest] = vcs;
  await vc.verify();
  if (vc.hasModel()) vc.runWithInterpreter();
  return rest.length === 0 ? { type: 'VERIFICATION_DONE' } : {
    type: 'ASYNCHRONOUS',
    start: { type: 'VERIFICATION_DONE' },
    end: verifyAll(rest)
  };
}

export function addAssumption (ivc: InteractiveVC): Action {
  try {
    const vcs = [ivc.vc, ...ivc.otherAssertions];
    vcs.forEach(vc => vc.addAssumption(ivc.inputAssumption));
    return {
      type: 'ASYNCHRONOUS',
      start: { type: 'UPDATE_ASSUMPTIONS', error: undefined },
      end: verifyAndInterpretAll(vcs)
    };
  } catch (e) {
    return {
      type: 'UPDATE_ASSUMPTIONS',
      error: String(e)
    };
  }
}

export function removeAssumption (ivc: InteractiveVC, index: number): Action {
  try {
    const vcs = [ivc.vc, ...ivc.otherAssertions];
    vcs.forEach(vc => vc.removeAssumption(index));
    return {
      type: 'ASYNCHRONOUS',
      start: { type: 'UPDATE_ASSUMPTIONS', error: undefined },
      end: verifyAndInterpretAll(vcs)
    };
  } catch (e) {
    return {
      type: 'UPDATE_ASSUMPTIONS',
      error: String(e)
    };
  }
}

export function reduce (state: AppState, action: BaseAction): AppState {
  switch (action.type) {
    case 'SELECT_EXAMPLE': {
      const { selected } = action;
      return {
        ...state,
        selected,
        selectedLine: undefined,
        sourceCode: getExample(selected).source,
        message: undefined,
        vcs: []
      };
    }
    case 'CHANGE_SOURCE': {
      const { newSource } = action;
      return { ...state, sourceCode: newSource, vcs: [], message: undefined, selectedVC: undefined };
    }
    case 'VERIFY': {
      const { vcs } = action;
      return {
        ...state,
        vcs: vcs.map((vc): InteractiveVC => ({
          vc,
          interpreted: false,
          otherAssertions: [],
          selectedAssertion: undefined,
          inputAssertion: '',
          inputAssertionError: undefined,
          inputAssumption: '',
          inputAssumptionError: undefined
        })),
        message: undefined,
        selectedVC: undefined
      };
    }
    case 'VERIFICATION_DONE': {
      return state;
    }
    case 'VERIFICATION_ERROR': {
      const { message } = action;
      return { ...state, vcs: [], message };
    }
    case 'SELECT_LINE': {
      const { line } = action;
      const vc = state.vcs.find(vc => vc.vc.getLocation().start.line === line);
      const selectedVC = interpret(vc);
      return {
        ...state,
        selectedLine: line,
        selectedVC: selectedVC && {
          ...selectedVC,
          inputAssertion: '',
          inputAssertionError: undefined
        }
      };
    }
    case 'SELECT_VC': {
      const { selected } = action;
      const vc = state.vcs.find(vc => vc.vc === selected);
      const selectedVC = interpret(vc);
      return {
        ...state,
        selectedVC: selectedVC && {
          ...selectedVC,
          inputAssertion: '',
          inputAssertionError: undefined
        }
      };
    }
    case 'SET_SOURCE_ANNOTATIONS': {
      const { enabled } = action;
      return { ...state, showSourceAnnotations: enabled };
    }
    case 'SELECT_ASSERTION': {
      const { selected } = action;
      if (state.selectedVC === undefined) return state;
      return { ...state, selectedVC: { ...state.selectedVC, selectedAssertion: selected } };
    }
    case 'REMOVE_ASSERTION': {
      const { index } = action;
      const vc = state.selectedVC;
      if (vc === undefined) return state;
      const prevSelected: VerificationCondition | undefined =
        vc.selectedAssertion === undefined ? undefined : vc.otherAssertions[vc.selectedAssertion];
      const otherAssertions: Array<VerificationCondition> =
        vc.otherAssertions.filter((_, idx) => idx !== index);
      const nextSelected: number = otherAssertions.findIndex(vc => vc === prevSelected);
      return {
        ...state,
        selectedVC: {
          ...vc,
          otherAssertions,
          selectedAssertion: nextSelected >= 0 ? nextSelected : undefined
        }
      };
    }
    case 'INPUT_ASSERTION': {
      const { source } = action;
      if (state.selectedVC === undefined) return state;
      return {
        ...state,
        selectedVC: {
          ...state.selectedVC,
          inputAssertion: source,
          inputAssertionError: undefined
        }
      };
    }
    case 'ADD_ASSERTION': {
      if (state.selectedVC === undefined) return state;
      const { vc } = action;
      if (typeof vc === 'string') {
        return {
          ...state,
          selectedVC: {
            ...state.selectedVC,
            inputAssertion: '',
            inputAssertionError: vc
          }
        };
      } else {
        return {
          ...state,
          selectedVC: {
            ...state.selectedVC,
            otherAssertions: [...state.selectedVC.otherAssertions, vc],
            selectedAssertion: state.selectedVC.otherAssertions.length,
            inputAssertion: '',
            inputAssertionError: undefined
          }
        };
      }
    }
    case 'INPUT_ASSUMPTION': {
      const { source } = action;
      if (state.selectedVC === undefined) return state;
      return {
        ...state,
        selectedVC: {
          ...state.selectedVC,
          inputAssumption: source,
          inputAssumptionError: undefined
        }
      };
    }
    case 'UPDATE_ASSUMPTIONS': {
      if (state.selectedVC === undefined) return state;
      const { error } = action;
      if (error === undefined) {
        return {
          ...state,
          selectedVC: {
            ...state.selectedVC,
            inputAssumption: '',
            inputAssumptionError: undefined
          }
        };
      } else {
        return {
          ...state,
          selectedVC: {
            ...state.selectedVC,
            inputAssumption: '',
            inputAssumptionError: error
          }
        };
      }
    }
  }
}
