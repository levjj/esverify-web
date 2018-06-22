import * as React from 'react';
import { JSVal, valueToString } from 'esverify';

export interface Props {
  dynamicValue: JSVal | undefined;
  staticValue: JSVal | undefined;
}

function eqValue (valueA: JSVal, valueB: JSVal): boolean {
  if (valueA === valueB) return true;
  switch (valueA.type) {
    case 'undefined':
    case 'null':
      return valueA.type === valueB.type;
    case 'bool':
    case 'num':
    case 'str':
      return valueA.type === valueB.type &&
             valueA.v === valueB.v;
    case 'fun':
      return false;
    case 'arr':
      return valueA.type === valueB.type &&
             valueA.elems.every((e, idx) => eqValue(e, valueB.elems[idx]));
    case 'obj':
      return valueA.type === valueB.type &&
             Object.keys(valueA.v).length === Object.keys(valueB.v).length &&
             Object.keys(valueA.v).every(key => key in valueB.v && eqValue(valueA.v[key], valueB.v[key]));
    case 'obj-cls':
      return valueA.type === valueB.type &&
             valueA.cls === valueB.cls &&
             valueA.args.every((e, idx) => eqValue(e, valueB.args[idx]));
  }
}

function randomId (): string {
  return `id${Math.trunc(Math.random() * 20000)}`;
}

function expandedValue (value: JSVal, counter: boolean) {
  switch (value.type) {
    case 'undefined':
    case 'null':
    case 'bool':
    case 'num':
    case 'str':
    case 'fun':
      return (<pre className='code'><code>{valueToString(value)}</code></pre>);
    case 'arr':
      return (<div>
        {value.elems.map((v, idx) => (
          <div key={idx}>
            <div className='float-left'>{idx}</div>
            {expandableValue(v, counter)}
          </div>
        ))}
        </div>
      );
    case 'obj':
      return (<div>
        {Object.keys(value.v).map((key, idx) => (
          <div key={idx}>
            <div className='float-left'>{key}</div>
            {expandableValue(value.v[key], counter)}
          </div>
        ))}
        </div>
      );
    case 'obj-cls':
      return (<div>
        {value.args.map((arg, idx) => (
          <div key={idx}>
            {expandableValue(arg, counter)}
          </div>
        ))}
        </div>
      );
  }
}

function expandableValue (value: JSVal, counter: boolean = false): JSX.Element {
  const id = randomId();
  const s = valueToString(value);
  return (
    <div className='accordion-item'>
      <input type='checkbox' id={id} name='accordion-checkbox' hidden />
      <label className='accordion-header' htmlFor={id}>
        <code className={'float-right text-right label' + (counter ? ' label-secondary' : '')}>
          {s.length > 22 ? s.substr(0, 19) + '..' : s}
        </code>
      </label>
      <div className='accordion-body' style={{ marginLeft: '1rem', clear: 'both' }}>
        {expandedValue(value, counter)}
      </div>
    </div>
  );
}

export default function Inspector ({ dynamicValue, staticValue }: Props) {
  if (dynamicValue === undefined) {
    return (
      <code className='float-right text-right label label-error'>
        &lt;&lt;error&gt;&gt;
      </code>
    );
  }
  return (
    staticValue === undefined || eqValue(dynamicValue, staticValue)
      ? <div className='accordion'>{expandableValue(dynamicValue)}</div>
      : <div className='accordion'>{expandableValue(dynamicValue)}{expandableValue(staticValue, true)}</div>
  );
}
