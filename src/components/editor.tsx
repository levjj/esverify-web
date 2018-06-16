import React = require('react');
import AceEditor, { Annotation } from 'react-ace';
import 'brace';
import 'brace/mode/javascript';
import 'brace/theme/chrome';
import { Action } from '../app';

export interface Props {
  sourceCode: string;
  annotations: Array<Annotation>;
  dispatch: (action: Action) => void;
}

export default function component ({ sourceCode, annotations, dispatch }: Props) {
  return (
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
      value={sourceCode}
    />
  );
}
