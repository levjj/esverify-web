import React = require('react');
import AceEditor, { Annotation, Marker } from 'react-ace';
import { Editor, Range } from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/chrome';
import { SourceLocation } from 'esverify';
import { Action } from '../app';

export interface Props {
  sourceCode: string;
  annotations: Array<Annotation>;
  selectedLine: number | undefined;
  sourceAnnotations: Array<[SourceLocation, Array<any>, any]>;
  dispatch: (action: Action) => void;
}

function valueToLabel (val: any): string {
  const s = String(val);
  return s.length > 32 ? s.substr(0, 29) + '..' : s;
}

export default function component ({ sourceCode, annotations, selectedLine, sourceAnnotations, dispatch }: Props) {
  // @ts-ignore testing dynamic markers
  const markers: Array<Marker> = selectedLine === undefined ? [] : [{
    startRow: selectedLine - 1,
    startCol: 0,
    endRow: selectedLine,
    endCol: 0,
    className: 'selectedVC',
    type: 'line'
  }];
  // @ts-ignore testing dynamic markers
  markers.push(...sourceAnnotations.map(([location, dynamicValues, staticValue]): Marker => ({
    startRow: location.start.line - 1,
    startCol: location.start.column,
    endRow: location.end.line - 1,
    endCol: location.end.column,
    className: 'sourceAnnotation',
    // @ts-ignore front marker
    inFront: true,
    type: function (this: { editor: Editor }, stringBuilder: Array<string>, range: Range,
                    left: number, top: number, config: any) {
      const height = config.lineHeight;
      const width = (range.end.column - range.start.column) * config.characterWidth;
      stringBuilder.push(
        `<div class="sourceAnnotation" style="height:${height}px;top:${top}px;left:${left + Math.floor(width / 2)}px">`,
          `<div class="sourceAnnotation-container">`,
           dynamicValues.map(val =>
              `<span class="label label-rounded">${valueToLabel(val)}</span>`
           ).join(''),
           dynamicValues.length === 1 && valueToLabel(dynamicValues) === valueToLabel(staticValue) ? '' :
              `<span class="label label-secondary label-rounded">${valueToLabel(staticValue)}</span>`,
          `</div>`,
          `<div class="arrow"></div>`,
        `</div>`
      );
    }
  })));
  markers.reverse();
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
        editor.getSession().on('changeFrontMarker', () => {
          // @ts-ignore access last marker ID
          const newMarker = editor.getSession().getMarkers(true)[editor.getSession().$markerId - 1];
          if (newMarker) newMarker.editor = editor;
        });
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
