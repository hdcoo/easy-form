import { InternalNamePath } from 'rc-field-form/es/interface';

export function lookUpward(namePath: InternalNamePath, upward: number): InternalNamePath {
  return namePath.slice(0, namePath.length - Math.abs(upward));
}

export function isNumber(v: any): v is number {
  return typeof v === 'number';
}

export function isString(v: any): v is string {
  return typeof v === 'string';
}

export function isPlainObject(v: any): boolean {
  return Object.prototype.toString.call(v) === '[object Object]';
}

export function flow(...funcs: Array<(...args: any[]) => any>) {
  const { length } = funcs;
  let index = length;
  while (index--) {
    if (typeof funcs[index] !== 'function') {
      throw new TypeError('Expected a function');
    }
  }
  return function (...args: any[]) {
    let i = 0;
    // @ts-ignore ignore this type
    let result = length ? funcs[i].apply(this, args) : args[0];
    while (++i < length) {
      // @ts-ignore ignore this type
      result = funcs[i].call(this, result);
    }
    return result;
  };
}

export function flowRight(funcs: Array<(...args: any[]) => any>) {
  return flow(...funcs.reverse());
}
