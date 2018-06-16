import { ExampleName, getExampleNames, getExample } from '../examples';
import React = require('react');
import { Action, selectExample } from '../app';

export interface Props {
  selected: ExampleName;
  dispatch: (action: Action) => void;
}

export default function component ({ selected, dispatch }: Props) {
  return (
    <div className='dropdown dropdown-right'>
      <a className='btn dropdown-toggle' tabIndex={0}>Examples ▼</a>
      <ul className='menu' id='examples'>
        {getExampleNames().map(exampleName => {
          const { name, description } = getExample(exampleName);
          return (
            <li className={name === selected ? 'menu-item active' : 'menu-item'} key={name}>
              <a href={`#${name}`} onClick={() => dispatch(selectExample(name))}>
                {description}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}