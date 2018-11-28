import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AceEditor, { Annotation } from 'react-ace';
import 'brace';
import 'brace/mode/typescript';
import 'brace/theme/chrome';
import * as ts from 'typescript';

let checked: boolean = false;
let loading: boolean = false;
let source: string = '';
let annotations: Annotation[] = [];

const searchParams = new URLSearchParams(window.location.search);
if (searchParams.has('source')) {
  source = searchParams.get('source') || source;
}

const heightParam = searchParams.get('height');
const height = heightParam === null ? 10 : +heightParam;

function messageType (diagnostic: ts.Diagnostic): 'info' | 'warning' | 'error' {
  switch (diagnostic.category) {
    case ts.DiagnosticCategory.Message: return 'info';
    case ts.DiagnosticCategory.Suggestion: return 'info';
    case ts.DiagnosticCategory.Warning: return 'warning';
  }
  return 'error';
}

function messageAsAnnotation (diagnostic: ts.Diagnostic): Annotation {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );
    const message = `(${line + 1}:${character}) ` + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    return {
      row: Math.max(0, line),
      column: character + 1,
      text: message,
      type: messageType(diagnostic)
    };
  } else {
    return {
      row: -1,
      column: 1,
      text: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      type: messageType(diagnostic)
    };
  }
}

function codeEdit (newSource: string) {
  source = newSource;
  annotations = [];
  setTimeout(() => render(), 0);
}

function typeCheck () {
  const sourceFile = ts.createSourceFile('module.ts', source, ts.ScriptTarget.ES5);
  const libFile = ts.createSourceFile('lib.d.ts', `
interface Function {
    apply(this: Function, thisArg: any, argArray?: any): any;
    call(this: Function, thisArg: any): any;
    bind(this: Function, thisArg: any): any;
    toString(): string;
    prototype: any;
    readonly length: number;
    arguments: any;
    caller: Function;
}`, ts.ScriptTarget.ES5);
  const compilerHost: ts.CompilerHost = {
    getSourceFile: (fileName: string) => {
      return fileName === 'module.ts' ? sourceFile :
            (fileName === 'lib.d.ts' ? libFile : undefined);
    },
    writeFile: () => { /* no action */ },
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: (fileName: string) => fileName,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
    fileExists: (fileName: string) => fileName === 'module.ts' || fileName === 'lib.d.ts',
    readFile: () => '',
    directoryExists: () => true,
    getDirectories: () => []
  };
  const program = ts.createProgram(['module.ts'], {
    noImplicitAny: true,
    strict: true,
    strictNullChecks: true,
    emit: false,
    module: ts.ModuleKind.CommonJS
  }, compilerHost);
  const diagnostics: ts.Diagnostic[] = [];
  for (const d of program.getSyntacticDiagnostics(sourceFile)) {
    if (d.file) diagnostics.push(d);
  }
  for (const d of program.getOptionsDiagnostics()) {
    if (d.file) diagnostics.push(d);
  }
  for (const d of program.getGlobalDiagnostics()) {
    if (d.file) diagnostics.push(d);
  }
  for (const d of program.getSemanticDiagnostics(sourceFile)) {
    if (d.file) diagnostics.push(d);
  }
  annotations = [];
  loading = true;
  setTimeout(() => {
    checked = true;
    loading = false;
    annotations = diagnostics.map(messageAsAnnotation);
    setTimeout(() => render(), 0);
  }, 400);
  setTimeout(() => render(), 0);
}

function render () {
  ReactDOM.render(
    <div className='clearfix'>
      <AceEditor
        style={{ width: '100%', height: height + 'rem' }}
        mode='typescript'
        theme='chrome'
        showPrintMargin={false}
        setOptions={{
          fontFamily: 'Fira Code',
          fontSize: '12pt'
        }}
        annotations={annotations}
        onChange={newSource => codeEdit(newSource)}
        value={source}
      />
      <div className='float-right'>
        { annotations.length === 0 && checked && !loading
          ? <span className='label label-success'>no errors</span>
          : ''}
        {' '}
        <button
          className={(loading ? 'loading ' : '') + 'btn btn-lg btn-primary'}
          onClick={() => typeCheck()}>typecheck</button>
      </div>
    </div>,
    document.getElementById('root')
  );
}

window.addEventListener('load', () => render());
