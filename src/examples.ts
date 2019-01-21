declare function require(name: string): any;
const exampleDir: any = require('dir-loader!../examples.config.js');

// work-around for an opaque type tag (not every string is a valid example name)
const enum _A {}
export type ExampleName = string & { __example: _A };

export interface Example {
  name: ExampleName;
  description: string;
  source: string;
}

export function getExampleNames (): ReadonlyArray<ExampleName> {
  const exampleNames: Array<ExampleName> =
    Object.keys(exampleDir).map(n => n.substr(0, n.length - 3)) as Array<ExampleName>;
  return exampleNames;
}

export function getExample (name: ExampleName): Example {
  const fileContents: string = exampleDir[name + '.js'].src;
  const firstLineBreak = fileContents.indexOf('\n');
  return {
    name,
    description: fileContents.substring(3, firstLineBreak),
    source: fileContents.substring(firstLineBreak + 1)
  };
}
