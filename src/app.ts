import { Message, setOptions, verificationConditions, VerificationCondition, transformSourceCode,
  formatMessage } from 'esverify';

import { ExampleName, getExample, getExampleNames } from './examples';
import { arraySplice } from './util';

// --- state ---

export type InteractiveVC = Readonly<{
  vc: VerificationCondition;
  interpreted: boolean;
  otherAssertions: ReadonlyArray<VerificationCondition>;
  selectedAssertion: number | undefined;
  inputAssertion: string;
  inputAssertionError: string | undefined;
  inputAssumption: string;
  inputAssumptionError: string | undefined;
  inputWatch: string;
  inputWatchError: string | undefined;
  selectedFrame: number | undefined;
}>;

export enum UserStudyStep {
  TUTORIAL_1,
  TUTORIAL_2,
  TUTORIAL_3,
  TUTORIAL_4,
  EXPERIMENT_1,
  EXPERIMENT_2,
  EXPERIMENT_3
}

export type UserStudyState = Readonly<{
  currentStep: UserStudyStep;
  showModal: boolean;
}>;

export type AppState = Readonly<{
  selected: ExampleName;
  selectedLine: number | undefined;
  sourceCode: string;
  message: Message | undefined;
  vcs: ReadonlyArray<InteractiveVC>;
  selectedVC: number | undefined;
  showSourceAnnotations: boolean;
  running: boolean;
  runMessage: string | undefined;
  userStudy: UserStudyState;
}>;

export function verificationInProgress (state: AppState): boolean {
  return state.vcs.some(vc => vc.vc.getResult() === null);
}

export function currentIVC (state: AppState): InteractiveVC | undefined {
  if (state.selectedVC === undefined) {
    return undefined;
  }
  return state.vcs[state.selectedVC];
}

export function currentVC (state: AppState | InteractiveVC): VerificationCondition | undefined {
  if ('vc' in state) {
    if (state.selectedAssertion === undefined) {
      return state.vc;
    } else {
      return state.otherAssertions[state.selectedAssertion];
    }
  } else {
    const ivc = currentIVC(state);
    if (ivc === undefined) {
      return undefined;
    }
    return currentVC(ivc);
  }
}

export function availableVerificationConditions (state: AppState): Array<InteractiveVC> {
  if (state.selectedLine === undefined) return [];
  return state.vcs.filter((vc) => vc.vc.getLocation().start.line === state.selectedLine);
}

export function initialState (): AppState {
  let initialExample = getExampleNames()[9];
  if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#max') {
    initialExample = getExampleNames().find(name => name === window.location.hash.substr(1)) || initialExample;
  }
  let sourceCode = getExample(initialExample).source;
  if (window.location.pathname.endsWith('/userstudy-experiments')) {
    sourceCode = sourceForUserStudy(UserStudyStep.TUTORIAL_1);
  }
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has('source')) {
    sourceCode = searchParams.get('source') || sourceCode;
  }
  return {
    selected: initialExample,
    selectedLine: undefined,
    sourceCode,
    message: undefined,
    vcs: [],
    selectedVC: undefined,
    showSourceAnnotations: true,
    running: false,
    runMessage: undefined,
    userStudy: {
      currentStep: UserStudyStep.TUTORIAL_1,
      showModal: true
    }
  };
}

function interpret (vc: InteractiveVC): InteractiveVC {
  if (!vc.interpreted && vc.vc.hasModel()) {
    vc.vc.runWithInterpreter();
    return {
      ...vc,
      interpreted: true,
      inputAssertion: '',
      inputAssertionError: undefined,
      inputAssumption: '',
      inputAssumptionError: undefined,
      inputWatch: '',
      inputWatchError: undefined,
      selectedFrame: vc.vc.callstack().length - 1
    };
  }
  return {
    ...vc,
    inputAssertion: '',
    inputAssertionError: undefined,
    inputAssumption: '',
    inputAssumptionError: undefined,
    inputWatch: '',
    inputWatchError: undefined,
    selectedFrame: undefined
  };
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

export interface RunCode {
  type: 'RUN_CODE';
}

export interface RunCodeDone {
  type: 'RUN_CODE_DONE';
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

export interface InputAssertion {
  type: 'INPUT_ASSERTION';
  source: string;
}

export interface AddAssertion {
  type: 'ADD_ASSERTION';
  vc: VerificationCondition | string;
}

export interface SelectAssertion {
  type: 'SELECT_ASSERTION';
  selected: number | undefined;
}

export interface RemoveAssertion {
  type: 'REMOVE_ASSERTION';
  index: number;
}

export interface InputAssumption {
  type: 'INPUT_ASSUMPTION';
  source: string;
}

export interface UpdateAssumptions {
  type: 'UPDATE_ASSUMPTIONS';
  error: string | undefined;
}

export interface InputWatch {
  type: 'INPUT_WATCH';
  source: string;
}

export interface AddWatch {
  type: 'ADD_WATCH';
}

export interface RemoveWatch {
  type: 'REMOVE_WATCH';
  index: number;
}

export interface SelectFrame {
  type: 'SELECT_FRAME';
  index: number;
}

export interface RestartInterpreter {
  type: 'RESTART_INTERPRETER';
}

export interface StepInto {
  type: 'STEP_INTO';
}

export interface StepOver {
  type: 'STEP_OVER';
}

export interface StepOut {
  type: 'STEP_OUT';
}

export interface UserStudyNext {
  type: 'USER_STUDY_NEXT';
}

export interface UserStudyCloseModal {
  type: 'USER_STUDY_CLOSE_MODAL';
}

export type BaseAction = SelectExample
                       | ChangeSource
                       | Verify
                       | VerificationDone
                       | VerificationError
                       | RunCode
                       | RunCodeDone
                       | SelectLine
                       | SelectVerificationCondition
                       | SetSourceAnnotations
                       | InputAssertion
                       | AddAssertion
                       | SelectAssertion
                       | RemoveAssertion
                       | InputAssumption
                       | UpdateAssumptions
                       | InputWatch
                       | AddWatch
                       | RemoveWatch
                       | SelectFrame
                       | RestartInterpreter
                       | StepInto
                       | StepOver
                       | StepOut
                       | UserStudyNext
                       | UserStudyCloseModal;
export type Action = BaseAction | AsynchrousAction;

// --- internal API ---

export function init (): void {
  setOptions({
    remote: true,
    z3url: '/z3',
    logformat: 'html',
    maxInterpreterSteps: 1000
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
        return { type: 'UPDATE_ASSUMPTIONS', error: undefined };
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
    return { type: 'UPDATE_ASSUMPTIONS', error: undefined };
  }
  const [vc, ...rest] = vcs;
  await vc.verify();
  if (vc.hasModel()) vc.runWithInterpreter();
  return rest.length === 0 ? { type: 'UPDATE_ASSUMPTIONS', error: undefined } : {
    type: 'ASYNCHRONOUS',
    start: { type: 'UPDATE_ASSUMPTIONS', error: undefined },
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

export function runCode (): Action {
  return {
    type: 'ASYNCHRONOUS',
    start: { type: 'RUN_CODE' },
    end: new Promise(resolve => {
      setTimeout(() => resolve({ type: 'RUN_CODE_DONE' }), 300);
    })
  };
}

function userStudyNextStep (step: UserStudyStep): UserStudyStep {
  switch (step) {
    case UserStudyStep.TUTORIAL_1: return UserStudyStep.TUTORIAL_2;
    case UserStudyStep.TUTORIAL_2: return UserStudyStep.TUTORIAL_3;
    case UserStudyStep.TUTORIAL_3: return UserStudyStep.TUTORIAL_4;
    case UserStudyStep.TUTORIAL_4: return UserStudyStep.EXPERIMENT_1;
    case UserStudyStep.EXPERIMENT_1: return UserStudyStep.EXPERIMENT_2;
    case UserStudyStep.EXPERIMENT_2: return UserStudyStep.EXPERIMENT_3;
    case UserStudyStep.EXPERIMENT_3: return UserStudyStep.EXPERIMENT_3;
  }
}

function sourceForUserStudy (step: UserStudyStep): string {
  switch (step) {
    case UserStudyStep.TUTORIAL_1:
      return `// This is a live demo, simply edit the code and click run

const height = 3;
const width = 4;
const area_of_rect = height * height;

// should print '12', but prints '9' instead
alert(area_of_rect)`;
    case UserStudyStep.TUTORIAL_2:
      return `
// returns the maximum of the two provided numbers
function max(a, b) {
  requires(typeof(a) === 'number');
  requires(typeof(b) === 'number');
  ensures(res => res >= a);
  ensures(res => res >= b);// postcondition does not hold

  if (a >= b) {
    return a;
  } else {
    return a; // <- due to a bug in the implementation
  }
}`;
    case UserStudyStep.TUTORIAL_3:
      return `
// returns the maximum of the two provided numbers
function max(a, b) {
  ensures(res => res >= a);
  ensures(res => res >= b);

  if (a >= b) {
    return a;
  } else {
    return b;
  }
}`;
    case UserStudyStep.TUTORIAL_4:
      return `
// returns the maximum of the two provided numbers
function max(a, b) {
  requires(typeof(a) === 'number');
  requires(typeof(b) === 'number');
  ensures(res => res >= a);
  ensures(res => res >= b);

  if (a > b) {
    return a;
  }
  if (b > a) {
    return b;
  }
}`;
    case UserStudyStep.EXPERIMENT_1:
      return `
// returns the factorial of the provided argument
function factorial(n) {
  requires(Number.isInteger(n));
  ensures(res => res >= 1);

  if (n === 0) {
    return 1;
  } else {
    return factorial(n - 1) * n;
  }
}`;
    case UserStudyStep.EXPERIMENT_2:
      return `
// Roll a six-sided dice
function rollDice () {
  // missing annotations
  // ensures(res => ...);

  return Math.trunc(Math.random() * 6) + 1;
}

const r = rollDice() + rollDice() + rollDice();
assert(r >= 3);
assert(r <= 18);`;
    case UserStudyStep.EXPERIMENT_3:
      return `
// Given the number of minutes since midnight,
// returns the current hour and minute as object
// in a { h: 0-23, m: 0-59 } format
function clock_24 (min) {
  requires(Number.isInteger(min) && 0 <= min);

  ensures(res => res instanceof Object &&
          'h' in res && 'm' in res);
  ensures(res => Number.isInteger(res.h) &&
          0 <= res.h && res.h < 24);
  ensures(res => Number.isInteger(res.m) &&
          0 <= res.m && res.m < 60);

  return {
    h: min / 60,
    m: min % 60
  };
}`;
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
      return {
        ...state,
        sourceCode: newSource,
        vcs: [],
        message: undefined,
        selectedLine: undefined,
        selectedVC: undefined,
        runMessage: undefined
      };
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
          inputAssumptionError: undefined,
          inputWatch: '',
          inputWatchError: undefined,
          selectedFrame: undefined
        })),
        message: undefined,
        runMessage: undefined,
        selectedVC: undefined
      };
    }
    case 'RUN_CODE': {
      return { ...state, running: true, runMessage: undefined };
    }
    case 'RUN_CODE_DONE': {
      const source = state.sourceCode;
      let runMessage: string;
      const transformed = transformSourceCode(source);
      if (typeof transformed !== 'string') {
        runMessage = formatMessage(transformed, false);
      } else {
        try {
          /* tslint:disable:no-eval */
          eval(transformed);
          runMessage = 'code ran successfully';
        } catch (e) {
          runMessage = String(e);
        }
      }
      return { ...state, running: false, runMessage };
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
      const selectedVC = state.vcs.findIndex(vc => vc.vc.getLocation().start.line === line);
      if (selectedVC < 0) {
        return { ...state, selectedLine: line, selectedVC: undefined };
      }
      return {
        ...state,
        selectedLine: line,
        vcs: arraySplice(state.vcs, selectedVC, interpret(state.vcs[selectedVC])),
        selectedVC
      };
    }
    case 'SELECT_VC': {
      const { selected } = action;
      const selectedVC = state.vcs.findIndex(vc => vc.vc === selected);
      if (selectedVC < 0) {
        return { ...state, selectedVC: undefined };
      }
      return {
        ...state,
        vcs: arraySplice(state.vcs, selectedVC, interpret(state.vcs[selectedVC])),
        selectedVC
      };
    }
    case 'SET_SOURCE_ANNOTATIONS': {
      const { enabled } = action;
      return { ...state, showSourceAnnotations: enabled };
    }
    case 'INPUT_ASSERTION': {
      const { source } = action;
      if (state.selectedVC === undefined) return state;
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          inputAssertion: source,
          inputAssertionError: undefined
        })
      };
    }
    case 'ADD_ASSERTION': {
      if (state.selectedVC === undefined) return state;
      const { vc } = action;
      if (typeof vc === 'string') {
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            inputAssertion: '',
            inputAssertionError: vc
          })
        };
      } else {
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            otherAssertions: [...state.vcs[state.selectedVC].otherAssertions, vc],
            selectedAssertion: state.vcs[state.selectedVC].otherAssertions.length,
            inputAssertion: '',
            inputAssertionError: undefined,
            selectedFrame: vc.hasModel() ? vc.callstack().length - 1 : undefined
          })
        };
      }
    }
    case 'SELECT_ASSERTION': {
      const { selected } = action;
      if (state.selectedVC === undefined) return state;
      const vc = selected === undefined
        ? state.vcs[state.selectedVC].vc
        : state.vcs[state.selectedVC].otherAssertions[selected];
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedAssertion: selected,
          selectedFrame: vc.hasModel() ? vc.callstack().length - 1 : undefined
        })
      };
    }
    case 'REMOVE_ASSERTION': {
      const { index } = action;
      if (state.selectedVC === undefined) return state;
      const vc = state.vcs[state.selectedVC];
      const prevSelected: VerificationCondition | undefined =
        vc.selectedAssertion === undefined ? undefined : vc.otherAssertions[vc.selectedAssertion];
      const otherAssertions: Array<VerificationCondition> =
        vc.otherAssertions.filter((_, idx) => idx !== index);
      const nextSelected: number = otherAssertions.findIndex(vc => vc === prevSelected);
      const nvc = nextSelected >= 0
        ? state.vcs[state.selectedVC].otherAssertions[nextSelected]
        : state.vcs[state.selectedVC].vc;
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          otherAssertions,
          selectedAssertion: nextSelected >= 0 ? nextSelected : undefined,
          selectedFrame: nvc.hasModel() ? nvc.callstack().length - 1 : undefined
        })
      };
    }
    case 'INPUT_ASSUMPTION': {
      const { source } = action;
      if (state.selectedVC === undefined) return state;
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          inputAssumption: source,
          inputAssumptionError: undefined
        })
      };
    }
    case 'UPDATE_ASSUMPTIONS': {
      if (state.selectedVC === undefined) return state;
      const { error } = action;
      if (error === undefined) {
        const vc = currentVC(state);
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            inputAssumption: '',
            inputAssumptionError: undefined,
            selectedFrame: vc !== undefined && vc.hasModel() ? vc.callstack().length - 1 : undefined
          })
        };
      } else {
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            inputAssumption: '',
            inputAssumptionError: error
          })
        };
      }
    }
    case 'INPUT_WATCH': {
      const { source } = action;
      if (state.selectedVC === undefined) return state;
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          inputWatch: source,
          inputWatchError: undefined
        })
      };
    }
    case 'ADD_WATCH': {
      const ivc = currentIVC(state);
      if (ivc === undefined || state.selectedVC === undefined) return state;
      const vcs = [ivc.vc, ...ivc.otherAssertions];
      try {
        vcs.forEach(vc => vc.addWatch(ivc.inputWatch));
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            inputWatch: '',
            inputWatchError: undefined
          })
        };
      } catch (e) {
        return {
          ...state,
          vcs: arraySplice(state.vcs, state.selectedVC, {
            ...state.vcs[state.selectedVC],
            inputWatch: '',
            inputWatchError: String(e)
          })
        };
      }
    }
    case 'REMOVE_WATCH': {
      const { index } = action;
      const ivc = currentIVC(state);
      if (ivc === undefined) return state;
      const vcs = [ivc.vc, ...ivc.otherAssertions];
      vcs.forEach(vc => vc.removeWatch(index));
      return state;
    }
    case 'SELECT_FRAME': {
      const { index } = action;
      const vc = currentVC(state);
      if (vc === undefined || state.selectedVC === undefined) return state;
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedFrame: index
        })
      };
    }
    case 'RESTART_INTERPRETER': {
      const vc = currentVC(state);
      if (vc === undefined || state.selectedVC === undefined) return state;
      vc.restart();
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedFrame: vc !== undefined && vc.hasModel() ? vc.callstack().length - 1 : undefined
        })
      };
    }
    case 'STEP_INTO': {
      const vc = currentVC(state);
      if (vc === undefined || state.selectedVC === undefined) return state;
      vc.stepInto();
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedFrame: vc !== undefined && vc.hasModel() ? vc.callstack().length - 1 : undefined
        })
      };
    }
    case 'STEP_OVER': {
      const vc = currentVC(state);
      if (vc === undefined || state.selectedVC === undefined) return state;
      vc.stepOver();
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedFrame: vc !== undefined && vc.hasModel() ? vc.callstack().length - 1 : undefined
        })
      };
    }
    case 'STEP_OUT': {
      const vc = currentVC(state);
      if (vc === undefined || state.selectedVC === undefined) return state;
      vc.stepOut();
      return {
        ...state,
        vcs: arraySplice(state.vcs, state.selectedVC, {
          ...state.vcs[state.selectedVC],
          selectedFrame: vc !== undefined && vc.hasModel() ? vc.callstack().length - 1 : undefined
        })
      };
    }
    case 'USER_STUDY_NEXT': {
      const next = userStudyNextStep(state.userStudy.currentStep);
      return {
        ...state,
        userStudy: {
          ...state.userStudy,
          currentStep: next,
          showModal: true
        },
        selectedLine: undefined,
        sourceCode: sourceForUserStudy(next),
        message: undefined,
        vcs: [],
        selectedVC: undefined,
        showSourceAnnotations: true
      };
    }
    case 'USER_STUDY_CLOSE_MODAL': {
      return {
        ...state,
        userStudy: {
          ...state.userStudy,
          showModal: false
        }
      };
    }
  }
}
