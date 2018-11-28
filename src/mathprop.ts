import { Heap, P, Syntax, Visitor } from 'esverify/build/main/logic';

import { flatMap } from 'esverify/build/main/util';
import { Model, JSVal } from 'esverify/build/main/model';
import { generatePreamble } from 'esverify/build/main/preamble';

const unOpToSMT: {[unop: string]: string} = {
  '-': '-',
  '+': '+',
  '!': '\\neg',
  '~': '\\~',
  'typeof': '\\texttt{typeof}~',
  'void': '\\texttt{void}~'
};

const binOpToSMT: {[binop: string]: string} = {
  '===': '=',
  '!==': '\\not =',
  '<': '<',
  '<=': '\\le',
  '>': '>',
  '>=': '\\ge',
  '+': '+',
  '-': '-',
  '*': '\\times',
  '/': '~\\texttt{div}~',
  '%': '~\\texttt{mod}~',
  '<<': '~\\texttt{lshift}~',
  '>>': '~\\texttt{rshift}~',
  '>>>': '~\\texttt{rzshift}~',
  '|': '\\texttt{or}',
  '^': '\\texttt{xor}',
  '&': '\\texttt{and}',
  'in': '\\texttt{in}', // unsupported
  'instanceof': '~\\texttt{instanceof}~' // unsupported
};

export function escapeName (n: string): string {
  let name = n;
  if (name[0] === '_') {
    name = name.substr(1);
  }
  return name.replace(/\$/g, '').replace(/\_([^_]+)$/, '_{$1}');
}

class MathGenerator extends Visitor<string, string, string, string> {

  visitLocation (loc: Syntax.Location): string {
    return escapeName(loc);
  }

  visitHeap (heap: Heap): string {
    return `H_{${heap}}`;
  }

  visitClassName (cls: Syntax.ClassName): string {
    return `\\texttt{${cls}}`;
  }

  visitHeapStore (expr: Syntax.HeapStore): string {
    return `${this.visitHeapExpr(expr.target)}[{${this.visitLocation(expr.loc)}}~\\mapsto~` +
                                              `{${this.visitExpr(expr.expr)}}]`;
  }

  visitHeapEffect (expr: Syntax.HeapEffect): string {
    const { callee, heap, thisArg, args } = expr;
    return `\\texttt{eff} \\left (${this.visitExpr(callee)}, ${this.visitHeapExpr(heap)}, ` +
             `${[thisArg, ...args].map(a => this.visitExpr(a)).join(', ')} \\right )`;
  }

  visitVariable (expr: Syntax.Variable): string {
    return escapeName(expr);
  }

  visitHeapReference (expr: Syntax.HeapReference): string {
    return `${this.visitHeapExpr(expr.heap)}[${this.visitLocation(expr.loc)}]`;
  }

  visitLiteral (expr: Syntax.Literal): string {
    if (expr.value === undefined) return `\\texttt{undefined}`;
    if (expr.value === null) return `\\texttt{null}`;
    if (typeof expr.value === 'boolean') {
      return expr.value ? `\\texttt{true}` : `\\texttt{false}`;
    } else if (typeof expr.value === 'number') {
      return '' + expr.value;
    } else {
      return `\\text{"${expr.value}"}`;
    }
  }

  visitUnaryExpression (expr: Syntax.UnaryExpression): string {
    const arg = this.visitExpr(expr.argument);
    const op = unOpToSMT[expr.operator];
    return `${op} ${arg}`;
  }

  visitBinaryExpression (expr: Syntax.BinaryExpression): string {
    const left = this.visitExpr(expr.left);
    const binop = binOpToSMT[expr.operator];
    const right = this.visitExpr(expr.right);
    return `${left} ${binop} ${right}`;
  }

  visitConditionalExpression (expr: Syntax.ConditionalExpression): string {
    if (expr.test.type === 'True') {
      return this.visitExpr(expr.consequent);
    } else if (expr.test.type === 'False') {
      return this.visitExpr(expr.alternate);
    } else {
      const test = this.visitProp(expr.test);
      const then = this.visitExpr(expr.consequent);
      const elze = this.visitExpr(expr.alternate);
      return `\\texttt{if}~${test}~\\texttt{then}~${then}~\\texttt{else}~${elze})`;
    }
  }

  visitCallExpression (expr: Syntax.CallExpression): string {
    const { callee, heap, thisArg, args } = expr;
    return `{${this.visitExpr(callee)}} \\left ( ${this.visitHeapExpr(heap)}, ` +
           `${[thisArg, ...args].map(a => this.visitExpr(a)).join(', ')} \\right )`;
  }

  visitNewExpression (expr: Syntax.NewExpression): string {
    if (expr.args.length === 0) {
      return `\\texttt{new}~\\texttt{${expr.className}}()`;
    } else {
      return `\\texttt{new}~\\texttt{${expr.className}} \\left (` +
             `${expr.args.map(a => this.visitExpr(a)).join(', ')} \\right )`;
    }
  }

  visitMemberExpression (expr: Syntax.MemberExpression): string {
    if (typeof expr.property !== 'string' &&
        expr.property.type === 'Literal' &&
        typeof expr.property.value === 'string') {
      return `{${this.visitExpr(expr.object)}} \\texttt{.${expr.property.value}}`;
    } else {
      return `{${this.visitExpr(expr.object)}} \\left [ {${this.visitExpr(expr.property)}} \\right ]`;
    }
  }

  visitArrayIndexExpression (expr: Syntax.ArrayIndexExpression): string {
    return `{${this.visitExpr(expr.array)}} \\left [ {${this.visitExpr(expr.index)}} \\right ]`;
  }

  visitRawSMTExpression (expr: Syntax.RawSMTExpression): string {
    let result = '';
    for (const e of expr.smt) {
      if (typeof e !== 'string') {
        result += this.visitExpr(e.e) + ' ';
      }
    }
    return result;
  }

  visitIsIntegerExpression (expr: Syntax.IsIntegerExpression): string {
    return `\\texttt{isInt}~\\left ( {${this.visitExpr(expr.expression)}} \\right )`;
  }

  visitToIntegerExpression (expr: Syntax.ToIntegerExpression): string {
    return `\\texttt{toInt}~\\left ( {${this.visitExpr(expr.expression)}} \\right )`;
  }

  visitTruthy (prop: Syntax.Truthy): string {
    if (typeof(prop.expr) === 'object' &&
        prop.expr.type === 'ConditionalExpression' &&
        typeof(prop.expr.consequent) === 'object' &&
        prop.expr.consequent.type === 'Literal' &&
        prop.expr.consequent.value === true &&
        typeof(prop.expr.alternate) === 'object' &&
        prop.expr.alternate.type === 'Literal' &&
        prop.expr.alternate.value === false) {
      return this.visitProp(prop.expr.test);
    }
    // return `\\texttt{truthy}~\\left ( {${this.visitExpr(prop.expr)}} \\right )`;
    return this.visitExpr(prop.expr);
  }

  visitAnd (prop: Syntax.And): string {
    const clauses: Array<string> = flatMap(prop.clauses,
      c => c.type === 'And' ? c.clauses : [c])
      .map(p => this.visitProp(p))
      .filter(s => s !== `\\texttt{true}`);
    if (clauses.find(s => s === `\\texttt{false}`)) return `\\texttt{false}`;
    if (clauses.length === 0) return `\\texttt{true}`;
    if (clauses.length === 1) return clauses[0];
    return clauses.join(' \\wedge ');
  }

  visitOr (prop: Syntax.Or): string {
    const clauses: Array<string> = flatMap(prop.clauses,
      c => c.type === 'Or' ? c.clauses : [c])
      .map(p => this.visitProp(p))
      .filter(s => s !== '\\texttt{true}');
    if (clauses.find(s => s === `true`)) return `\\texttt{true}`;
    if (clauses.length === 0) return `\\texttt{false}`;
    if (clauses.length === 1) return clauses[0];
    const negatedClauses: Array<P> = [];
    const positiveClauses: Array<P> = [];
    for (const cl of flatMap(prop.clauses, c => c.type === 'Or' ? c.clauses : [c])) {
      if (cl.type === 'Not' && this.visitProp(cl.arg) !== '\\texttt{false}') {
        negatedClauses.push(cl.arg);
      } else if (this.visitProp(cl) !== '\\texttt{true}') {
        positiveClauses.push(cl);
      }
    }
    if (negatedClauses.length > 0 && positiveClauses.length > 0) {
      return `\\left ( ${this.visitProp({ type: 'And', clauses: negatedClauses })} ` +
             ` \\Rightarrow ${this.visitProp({ type: 'Or', clauses: positiveClauses })} \\right )`;
    }
    return clauses.join(' \\vee ');
  }

  visitEq (prop: Syntax.Eq): string {
    const left: string = this.visitExpr(prop.left);
    const right: string = this.visitExpr(prop.right);
    if (left === right) return `\\texttt{true}`;
    return `${left} = ${right}`;
  }

  visitHeapEq (prop: Syntax.HeapEq): string {
    const left: string = this.visitHeapExpr(prop.left);
    const right: string = this.visitHeapExpr(prop.right);
    if (left === right) return `\\texttt{true}`;
    return `${left} = ${right}`;
  }

  visitNot (prop: Syntax.Not): string {
    const arg: string = this.visitProp(prop.arg);
    if (arg === '\\texttt{true}') return `\\texttt{false}`;
    if (arg === '\\texttt{false}') return `\\texttt{true}`;
    return `\\not ${arg}`;
  }

  visitTrue (prop: Syntax.True): string {
    return `\\texttt{true}`;
  }

  visitFalse (prop: Syntax.False): string {
    return `\\texttt{false}`;
  }

  visitPrecondition (prop: Syntax.Precondition): string {
    const { callee, heap, thisArg, args } = prop;
    const a = [thisArg, ...args];
    return `\\texttt{pre} \\left (${this.visitExpr(callee)}, ${this.visitHeapExpr(heap)}, ` +
           `${a.map(a => ' ' + this.visitExpr(a)).join(', ')} \\right )`;
  }

  visitPostcondition (prop: Syntax.Postcondition): string {
    const { callee, heap, thisArg, args } = prop;
    const a = [thisArg, ...args];
    return `\\texttt{post} \\left (${this.visitExpr(callee)}, ${this.visitHeapExpr(heap)},  ` +
           `${a.map(a => ' ' + this.visitExpr(a)).join(', ')} \\right )`;
  }

  visitForAllCalls (prop: Syntax.ForAllCalls): string {
    const { callee, heap, args, fuel } = prop;
    let params = `${args.map(a => this.visitVariable(a)).join(', ')}`;
    const callP: P = { type: 'CallTrigger', callee, heap, thisArg: prop.thisArg, args, fuel };
    let p = this.visitProp(prop.prop);
    if (prop.existsLocs.size + prop.existsHeaps.size + prop.existsVars.size > 0) {
      params += `. ~ \\exists {${[...prop.existsHeaps].map(h => this.visitHeap(h)).join(', ')} `
                 + `${[...prop.existsLocs].map(l => this.visitLocation(l)).join(', ')} `
                 + `${[...prop.existsVars].map(v => this.visitVariable(v)).join(', ')}}`;
    }
    const trigger: string = this.visitProp(callP);
    return `\\left ( \\forall ${this.visitHeap(heap)}, `
                  + `${this.visitVariable(prop.thisArg)}, `
                  + `${params}. ~~ \\left \\{ ${trigger} \\right \\} \\Rightarrow ~~ ${p} \\right )`;
  }

  visitCallTrigger (prop: Syntax.CallTrigger): string {
    const { callee, heap, thisArg, args } = prop;
    const a = [thisArg, ...args];
    return `\\texttt{call} \\left (${this.visitExpr(callee)}, ${this.visitHeapExpr(heap)}, ` +
           `${a.map(a => ' ' + this.visitExpr(a)).join(', ')} \\right )`;
  }

  visitForAllAccessObject (prop: Syntax.ForAllAccessObject): string {
    const { heap, fuel } = prop;
    const accessP: P = { type: 'AccessTrigger', object: prop.thisArg, property: 'thisProp', heap, fuel };
    let p = this.visitProp(prop.prop);
    const trigger: string = this.visitProp(accessP);
    return `\\left ( \\forall ${this.visitHeap(heap)}, `
                  + `${this.visitVariable(prop.thisArg)}, `
                  + `${this.visitVariable('thisProp')}. ~~ `
                  + `\\left \\{ ${trigger} \\right \\} \\Rightarrow ~~ {${p}} \\right )`;
  }

  visitForAllAccessProperty (prop: Syntax.ForAllAccessProperty): string {
    const { heap, fuel } = prop;
    const accessP: P = { type: 'AccessTrigger', object: prop.object, property: prop.property, heap, fuel };
    let p = this.visitProp(prop.prop);
    const trigger: string = this.visitProp(accessP);
    return `\\left ( \\forall ${this.visitHeap(heap)}, `
                  + `${this.visitVariable(prop.property)}. ~~ `
                  + `\\left \\{ ${trigger} \\right \\} \\Rightarrow ~~ {${p}} \\right )`;
  }

  visitInstanceOf (prop: Syntax.InstanceOf): string {
    return `${this.visitExpr(prop.left)}~\\texttt{instanceof}~${this.visitClassName(prop.right)}`;
  }

  visitHasProperty (prop: Syntax.HasProperty): string {
    return `${this.visitExpr(prop.object)}~\\texttt{in}~${this.visitExpr(prop.property)}`;
  }

  visitHasProperties (prop: Syntax.HasProperties): string {
    const keys = prop.properties.map(p => `"${p}"`).join(', ');
    return `\\texttt{keys} \\left (${this.visitExpr(prop.object)} \\right ) = \\left \\{ ${keys} \\right \\}`;
  }

  visitInBounds (prop: Syntax.InBounds): string {
    return `0 \\le ${this.visitExpr(prop.index)} < ${this.visitExpr(prop.array)} \\texttt{.length}`;
  }

  visitAccessTrigger (prop: Syntax.AccessTrigger): string {
    return `\\texttt{access} \\left ( ` +
           `${this.visitExpr(prop.object)}, ${this.visitExpr(prop.property)}, ${this.visitHeapExpr(prop.heap)}` +
           `\\right )`;
  }
}

export function propositionToMath (prop: P): string {
  if (prop.type === 'And') {
    return '\\[ ' +
      flatMap(prop.clauses, c => c.type === 'And' ? c.clauses : [c])
      .map(p => new MathGenerator().visitProp(p))
      .join('~ \\wedge ~ \\] \n\n \\[ ') + '\\]';
  }
  return `\\[ ${new MathGenerator().visitProp(prop)} \\]`;
}

export function valueToMath (value: JSVal): string {
  switch (value.type) {
    case 'num':
      return `${value.v}`;
    case 'bool':
      return value.v ? '\\texttt{true}' : '\\texttt{false}';
    case 'str':
      return `\\text{''${value.v}''}`;
    case 'null':
      return '\\texttt{null}';
    case 'undefined':
      return '\\texttt{undefined}';
    case 'fun':
      return `\\texttt{func}_{${Math.trunc(Math.random() * 10000)}}`;
    case 'obj':
      return '\\left \\{ '
        + Object.keys(value.v).map(key => `\\text{"${key}"}: ${valueToMath(value.v[key])}`).join(', ')
        + ' \\right \\}';

    case 'obj-cls':
      return `\\texttt{new ${value.cls}} \\left \\( ${value.args.map(valueToMath).join(', ')} \\right \\)`;
    case 'arr':
      return `\\left [ ${value.elems.map(valueToMath).join(', ')} \\right ]`;
  }
}

export function modelToMath (model: Model): string {
  let result = '';
  const vars = [...model.variables()];
  vars.sort();
  for (const varname of vars) {
    if (generatePreamble().vars.has(varname) || generatePreamble().locs.has(varname) ||
        varname.startsWith('Array') || varname.startsWith('String')) {
      continue;
    }
    if (model.mutableVariables().has(varname)) {
      for (let heap = 0; heap++; heap < 10) {
        try {
          const val = model.valueOf({ name: varname, heap });
          result += `\n\\[ ${varname}_{${heap}} = ${valueToMath(val)} \\]\n`;
        } catch (e) { /* ignore errors */ }
      }
    } else {
      result += `\n\\[ ${escapeName(varname)} = ${valueToMath(model.valueOf(varname))} \\]\n`;
    }
  }
  return result;
}
