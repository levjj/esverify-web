import React = require('react');
import AceEditor, { Annotation, Marker } from 'react-ace';
import { Editor } from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/chrome';
import { Action } from '../app';

export interface Props {
  sourceCode: string;
  annotations: Array<Annotation>;
  selectedLine: number | undefined;
  dispatch: (action: Action) => void;
}

export default function component ({ sourceCode, annotations, selectedLine, dispatch }: Props) {
  const markers: Array<Marker> = selectedLine === undefined ? [] : [{
    startRow: selectedLine - 1,
    startCol: 0,
    endRow: selectedLine,
    endCol: 0,
    className: 'selectedVC',
    type: 'line'
  }];
  return (
    <AceEditor
      style={{ width: '100%', height: '65vh' }}
      mode='javascript'
      theme='chrome'
      showPrintMargin={false}
      setOptions={{
        fontFamily: 'Fira Code',
        fontSize: '11pt'
      }}
      annotations={annotations}
      highlightActiveLine={false}
      markers={markers}
      onLoad={editorProps => {
        const editor = editorProps as Editor;
        const gutter: any = (editor.renderer as any).$gutterLayer;
        editor.on('guttermousedown', (e: any) => {
          if (e.getButton() !== 0 || gutter.getRegion(e) === 'foldWidgets') {
            return;
          }
          const line: number = e.getDocumentPosition().row + 1;
          const markersWithIds: any = editor.getSession().getMarkers(false);
          const markers: Array<any> = Object.keys(markersWithIds).map(key => markersWithIds[key]);
          const selectedVCMarker = markers.find(m => m.clazz === 'selectedVC');
          if (selectedVCMarker !== undefined && line === selectedVCMarker.range.start.row + 1) {
            dispatch({ type: 'SELECT_LINE', line: undefined });
          } else {
            if (!editor.getSession().getAnnotations().some((a: Annotation) => a.row + 1 === line)) {
              return;
            }
            dispatch({ type: 'SELECT_LINE', line });
          }
          e.preventDefault();
        });
      }}
      onChange={newSource => dispatch({ type: 'CHANGE_SOURCE', newSource })}
      value={sourceCode}
    />
  );
}
