import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AceEditor from 'react-ace';
import 'brace';
import 'brace/mode/javascript';
import 'brace/mode/scheme';
import 'brace/theme/chrome';
import { formatMessage, setOptions, verificationConditions, testPreamble } from 'esverify';
import { P, removePrefix, and } from 'esverify/build/main/logic';
import { instantiateQuantifiers } from 'esverify/build/main/qi';
import { generatePreamble } from 'esverify/build/main/preamble';
import { propositionToMath, modelToMath, escapeName } from './mathprop';
import { Model } from 'esverify/build/main/model';

interface InternalVerificationCondition {
  vars: Set<string>;
  heaps: Set<number>;
  locs: Set<string>;
  prop: P;
  freeVars: Array<string | { name: string, heap: number }>;
  model: Model;
  assumptions: Array<{ prop: P }>;
  assertion: P;
  testSource (): string;
  prepareSMT (): string;
  solveRemote (smtin: string): Promise<string>;
}

interface Result {
  message: string;
  math: string;
  qi: string;
  counter: string;
  test: string;
  smtIn: string;
  smtOut: string;
}

let result: Result | undefined = undefined;
let loading: boolean = false;
let source: string = '';
let verifyTimeout: NodeJS.Timeout = setTimeout(() => {/*nothing*/}, 0);

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('source')) {
  source = searchParams.get('source') || source;
}

const vcnParam = searchParams.get('vcn');
const vcn = vcnParam === null ? undefined : +vcnParam;

const heightParam = searchParams.get('height');
const height = heightParam === null ? 10 : +heightParam;

const ontype = searchParams.has('ontype');
const showMath = searchParams.has('math');
const showMathVertical = searchParams.has('mathv');
const showQI = searchParams.has('qi');
const showSMTIn = searchParams.has('smtin');
const showSMTInHorizontal = searchParams.has('smtinh');
const showSMTOut = searchParams.has('smtout');
const showCounter = searchParams.has('counter');
const showTest = searchParams.has('test');
const removeForAll = searchParams.has('remforall');
const removeFirstForAll = searchParams.has('remfforall');

function vcToMath (vc: InternalVerificationCondition): string {
  const vars = [...vc.vars]
    .filter(varname => !generatePreamble().vars.has(varname) && !generatePreamble().locs.has(varname))
    .map(escapeName);
  for (const h of vc.heaps) {
    vars.push(`H_${h}`);
  }
  let result = '';
  if (vars.length > 0) {
    result += '\\[ \\forall ' + vars.join(', ') + '. \\] \n';
  }
  const propAndAssumptions = and(vc.prop, ...vc.assumptions.map(({ prop }) => prop));
  const prop = removePrefix(generatePreamble().prop, propAndAssumptions);
  if (prop.type === 'And' && removeForAll) {
    prop.clauses = prop.clauses.filter(cl =>
      cl.type !== 'ForAllCalls' && cl.type !== 'ForAllAccessObject' && cl.type !== 'ForAllAccessProperty');
  } else if (prop.type === 'And' && removeFirstForAll) {
    let first = true;
    prop.clauses = prop.clauses.filter(cl =>
      !first ||
      (cl.type !== 'ForAllCalls' && cl.type !== 'ForAllAccessObject' && cl.type !== 'ForAllAccessProperty') ||
      (first = false, false));
  }
  result += propositionToMath(prop);
  result += '\n \\[ \\Longrightarrow \\] \n';
  result += propositionToMath(vc.assertion);
  return result;
}

function vcToQIMath (vc: InternalVerificationCondition): string {
  const vars = [...vc.vars]
    .filter(varname => !generatePreamble().vars.has(varname) && !generatePreamble().locs.has(varname))
    .map(escapeName);
  for (const h of vc.heaps) {
    vars.push(`H_${h}`);
  }
  let result = '';
  if (vars.length > 0) {
    result += '\\[ \\forall ' + vars.join(', ') + '. \\] \n';
  }
  const propAndAssumptions = and(vc.prop, ...vc.assumptions.map(({ prop }) => prop));
  let prop = removePrefix(generatePreamble().prop, propAndAssumptions);
  prop = instantiateQuantifiers(vc.heaps, vc.locs, vc.vars, vc.freeVars, prop);
  result += propositionToMath(prop);
  result += '\n \\[ \\Longrightarrow \\] \n';
  result += propositionToMath(vc.assertion);
  return result;
}

function smtPrefixLength (vc: InternalVerificationCondition): number {
  const { prop, assumptions, assertion } = vc;
  vc.prop = generatePreamble().prop;
  vc.assumptions = [];
  vc.assertion = { type: 'True' };
  const smtLength = vc.prepareSMT().length;
  vc.prop = prop;
  vc.assumptions = assumptions;
  vc.assertion = assertion;
  return smtLength - '(assert false)\n\n(check-sat)\n(get-model)'.length + 1579;
}

function sleep (ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(void(0)), ms);
  });
}

async function codeEdit (newSource: string) {
  source = newSource;
  result = undefined;
  await sleep(0);
  if (ontype) {
    clearTimeout(verifyTimeout);
    verifyTimeout = setTimeout(() => verify(), 1000);
  } else {
    render();
  }
}

async function verify () {
  loading = true;
  await sleep(0);
  render();
  await sleep(100);
  const verificationResult = verificationConditions(source);
  if (!(verificationResult instanceof Array)) {
    result = {
      message: formatMessage(verificationResult),
      math: '',
      qi: '',
      counter: '',
      test: '',
      smtIn: '',
      smtOut: ''
    };
  } else if (verificationResult.length < 1) {
    result = {
      message: 'no verification conditions',
      math: '',
      qi: '',
      counter: '',
      test: '',
      smtIn: '',
      smtOut: ''
    };
  } else {
    const vc = verificationResult[vcn === undefined ? verificationResult.length - 1 : vcn];
    const ivc = vc as any as InternalVerificationCondition;
    const msg = await vc.verify();
    const smtIn = showSMTIn || showSMTInHorizontal ?
      ivc.prepareSMT().substr(smtPrefixLength(ivc)).replace(/\n\n+/g, '\n') : '';
    let smtOut: string = '';
    if (showSMTOut) {
      smtOut = await ivc.solveRemote(ivc.prepareSMT());
      if (smtOut.startsWith('unsat')) {
        smtOut = 'unsat';
      }
    }
    result = {
      message: formatMessage(msg),
      math: showMath || showMathVertical ? vcToMath(ivc) : '',
      qi: showQI ? vcToQIMath(ivc) : '',
      counter: showCounter && vc.hasModel() ? modelToMath(ivc.model) : '',
      test: showTest && vc.hasModel() ?
        ivc.testSource().substr(testPreamble().length + 64).replace(/\n\n+/g, '\n') : '',
      smtIn: showSMTIn || showSMTInHorizontal ? smtIn : '',
      smtOut: showSMTOut ? smtOut : ''
    };
  }
  loading = false;
  await sleep(0);
  render();
}

function twoColumns (): boolean {
  return (showMath || showCounter || showTest) && !showSMTInHorizontal
     || !(showMath || showCounter || showTest) && showSMTInHorizontal;
}

function threeColumns (): boolean {
  return (showMath || showCounter || showTest) && showSMTInHorizontal;
}

function mathView (): JSX.Element {
  const mathContent = result === undefined ? '' : result.math;
  setTimeout(() => {
    const mathDisplay = document.getElementById('mathDisplay');
    if (mathDisplay === null) return;
    mathDisplay.innerHTML = mathContent;
    // @ts-ignore update mathjax content
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, mathDisplay]);
  }, 10);
  return <div id='mathDisplay'></div>;
}

function qiView (): JSX.Element {
  const mathContent = result === undefined ? '' : result.qi;
  setTimeout(() => {
    const mathDisplay = document.getElementById('qiDisplay');
    if (mathDisplay === null) return;
    mathDisplay.innerHTML = mathContent;
    // @ts-ignore update mathjax content
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, mathDisplay]);
  }, 10);
  return <div id='qiDisplay'></div>;
}

function counterView (): JSX.Element {
  const mathContent = result === undefined ? '' : result.counter;
  setTimeout(() => {
    const mathDisplay = document.getElementById('counterDisplay');
    if (mathDisplay === null) return;
    mathDisplay.innerHTML = mathContent;
    // @ts-ignore update mathjax content
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, mathDisplay]);
  }, 10);
  return <div id='counterDisplay'></div>;
}

function testView (): JSX.Element {
  return <AceEditor
            style={{ width: '100%', height: (height * 3) + 'rem' }}
            mode='javascript'
            theme='chrome'
            showPrintMargin={false}
            setOptions={{
              fontFamily: 'Fira Code',
              fontSize: '12pt'
            }}
            readOnly={true}
            value={result === undefined ? '' : result.test}
          />;
}

function smtInView (): JSX.Element {
  return <AceEditor
            style={{ width: '100%', height: (height + 4) + 'rem' }}
            mode='scheme'
            theme='chrome'
            showPrintMargin={false}
            setOptions={{
              fontFamily: 'Fira Code',
              fontSize: '12pt'
            }}
            readOnly={true}
            value={result === undefined ? '' : result.smtIn}
          />;
}

function smtOutView (): JSX.Element {
  return <AceEditor
            style={{ width: '100%', height: '4rem' }}
            mode='scheme'
            theme='chrome'
            showPrintMargin={false}
            setOptions={{
              fontFamily: 'Fira Code',
              fontSize: '12pt'
            }}
            readOnly={true}
            value={result === undefined ? '' : result.smtOut}
          />;
}

function render () {
  ReactDOM.render(
    <div className='clearfix'>
      <div className='columns'>
        <div className={'column ' + (
          threeColumns() ? 'col-4' : (twoColumns() ? 'col-6' : 'col-12'))}>
          <AceEditor
            style={{ width: '100%', height: height + 'rem' }}
            mode='javascript'
            theme='chrome'
            showPrintMargin={false}
            setOptions={{
              fontFamily: 'Fira Code',
              fontSize: '12pt'
            }}
            onChange={newSource => codeEdit(newSource)}
            value={source}
          />
        </div>
        { !twoColumns() && !threeColumns() ? '' :
          <div className={'column ' + (threeColumns() ? 'col-3' : 'col-6')}>
            {showMath ? mathView() : ''}
            {showCounter ? <div className='divider text-center' data-content='COUNTEREXAMPLE'></div> : ''}
            {showCounter ? counterView() : ''}
            {twoColumns() && showSMTInHorizontal ?
              <div className='divider text-center' data-content='SMT INPUT'></div> : ''}
            {twoColumns() && showSMTInHorizontal ? <div className='my-2'>{smtInView()}</div> : ''}
          </div>
        }
        { !threeColumns() ? '' :
          <div className='column col-5'>
            {showSMTInHorizontal ? smtInView() : ''}
          </div>
        }
      </div>
      {showMathVertical ? mathView() : ''}
      {showQI && result !== undefined && result.qi !== ''
        ? <div className='divider text-center' data-content='AFTER QUANTIFIER INSTANTIATION'></div> : ''}
      {showQI ? <div className='my-2'>{qiView()}</div> : ''}
      {showSMTIn ? <div className='divider text-center' data-content='SMT INPUT'></div> : ''}
      {showSMTIn ? <div className='my-2'>{smtInView()}</div> : ''}
      {showSMTOut ? <div className='divider text-center' data-content='SMT OUTPUT'></div> : ''}
      {showSMTOut ? <div className='my-2'>{smtOutView()}</div> : ''}
      {showTest ? <div className='divider text-center' data-content='TEST'></div> : ''}
      {showTest ? testView() : ''}
      <div className='float-right'>
        { result !== undefined
          ? <span className={'label'}
                  dangerouslySetInnerHTML={{ __html: result.message }} />
          : ''}
        {' '}
        <button
          className={(loading ? 'loading ' : '') + 'btn btn-lg btn-primary'}
          onClick={() => verify()}>verify</button>
      </div>
    </div>,
    document.getElementById('root')
  );
}

setOptions({
  remote: true,
  z3url: '/z3',
  logformat: 'html',
  maxInterpreterSteps: 1000
});

window.addEventListener('load', () => render());
