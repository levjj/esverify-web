import React = require('react');
import AceEditor, { Annotation, Marker } from 'react-ace';
import { Editor, Range } from 'brace';
import 'brace/mode/javascript';
import 'brace/theme/chrome';
import { SourceLocation, JSVal, valueToString } from 'esverify';
import { Action } from '../app';

export interface Props {
  sourceCode: string;
  annotations: Array<Annotation>;
  selectedVC: SourceLocation | undefined;
  pc: SourceLocation | undefined;
  sourceAnnotations: Array<[SourceLocation, Array<JSVal | undefined>, JSVal | undefined]>;
  dispatch: (action: Action) => void;
}

function valueToLabel (val: JSVal): string {
  const s = valueToString(val);
  return s.length > 32 ? s.substr(0, 29) + '..' : s;
}

export default function component ({ sourceCode, annotations, selectedVC, pc, sourceAnnotations, dispatch }: Props) {
  const markers: Array<Marker> = pc === undefined ? [] : [{
    startRow: pc.start.line - 1,
    startCol: pc.start.column,
    endRow: pc.end.line - 1,
    endCol: pc.end.column,
    className: 'pc',
    type: 'text'
  }];
  if (selectedVC !== undefined) {
    markers.push({
      startRow: selectedVC.start.line - 1,
      startCol: selectedVC.start.column,
      endRow: selectedVC.end.line - 1,
      endCol: selectedVC.end.column,
      className: 'selectedVC',
      type: 'text'
    });
  }
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
           dynamicValues.filter(val => val !== undefined).map(val =>
              `<span class="label label-rounded">${valueToLabel(val as JSVal)}</span>`
           ).join(''),
           staticValue === undefined ||
           (dynamicValues.length === 1 && dynamicValues[0] !== undefined && staticValue !== undefined &&
            valueToLabel(dynamicValues[0] as JSVal) === valueToLabel(staticValue)) ? '' :
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
      style={{ width: '100%', height: '80vh' }}
      mode='javascript'
      theme='chrome'
      showPrintMargin={false}
      setOptions={{
        fontFamily: 'Fira Code',
        fontSize: '11pt',
        tabSize: 2
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
