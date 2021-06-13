import React, { RefAttributes, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { NamePath } from 'rc-field-form/es/interface';
import FormAccess from './FormAccess';

import useLocalForm from './useLocalForm';
import useFieldsChange from './useFieldsChange';
import { isNumber } from './helper/utils';
import { Store } from './helper/interface';

export interface IFormListOperators<T> {
  unshift: (initialValue?: T) => void;
  add: (initialValue?: T) => void;
  remove: (i: number) => void;
  move: (from: number, to: number) => void;
}

export interface IFieldInfo<V> {
  key: number;
  index: number;
  _: V;
}

interface IKeyManager {
  id: number;
  keys: number[];
}

export interface FormListProps<V> {
  name?: NamePath;
  children: (fields: Array<IFieldInfo<V>>, operators: IFormListOperators<V>) => React.ReactNode;
}

// 默认 namePath
const DEFAULT_NAME: NamePath = [];

function FormList<V extends Store>(
  props: FormListProps<V>,
  ref: React.Ref<IFormListOperators<V>>,
) {
  const { name = DEFAULT_NAME, children } = props;
  const [form] = useLocalForm();
  const keyManager = useRef<IKeyManager>({
    id: 0,
    keys: [],
  });
  const internalOperate = useRef(false);
  const [signature, setSignature] = useState(0);

  const handleAdd = useCallback((initialValue?: V) => {
    const originList = form.getFieldValue(name) as V[];
    const newList = [...(originList || []), initialValue];

    keyManager.current.keys.push(keyManager.current.id);
    keyManager.current.id += 1;
    internalOperate.current = true;

    form.dispatchValue(name, newList);
  }, [form, name]);

  const handleUnshift = useCallback((initialValue?: V) => {
    const originList = form.getFieldValue(name) as V[];
    const newList = [initialValue, ...(originList || [])];

    keyManager.current.keys.unshift(keyManager.current.id);
    keyManager.current.id += 1;
    internalOperate.current = true;

    form.dispatchValue(name, newList);
  }, [form, name]);

  const handleRemove = useCallback((index: number) => {
    const originList = form.getFieldValue(name) as V[];
    const newList = [...(originList || [])];

    newList.splice(index, 1);
    keyManager.current.keys.splice(index, 1);
    internalOperate.current = true;

    form.dispatchValue(name, newList);
  }, [form, name]);

  const handleMove = useCallback((from: number, to: number) => {
    if (from === to || !isNumber(from) || !isNumber(to)) {
      return;
    }

    const newList = [...(form.getFieldValue(name) || []) as V[]];

    if (from < 0 || from >= newList.length || to < 0 || to >= newList.length) {
      return;
    }

    const item = newList[from];
    const key = keyManager.current.keys[from];

    newList.splice(from, 1);
    newList.splice(to, 0, item);

    keyManager.current.keys.splice(from, 1);
    keyManager.current.keys.splice(to, 0, key);
    internalOperate.current = true;

    form.dispatchValue(name, newList);
  }, [form, name]);

  const content = useMemo(() => {
    const list = (form.getFieldValue(name) || []) as V[];
    const fields = list.map((_, index) => {
      let key = keyManager.current.keys[index];

      if (key === undefined) {
        keyManager.current.keys[index] = keyManager.current.id;
        key = keyManager.current.keys[index];
        keyManager.current.id += 1;
      }

      return { key, index, _ };
    });

    return children(fields, {
      add: handleAdd,
      unshift: handleUnshift,
      remove: handleRemove,
      move: handleMove,
    });
    // eslint-disable-next-line
  }, [children, signature, form, name]);

  // 缓存依赖，以免每次都触发 useFieldsChange 重新注册监听
  const dependencies = useMemo(() => [name], [name]);

  const handleDependenciesChange = useCallback(() => {
    // 当 useFieldsChange 触发时，可能有两种情况
    // 1.更新操作是由 FormList 本身触发，即调用 handleAdd 或 handleRemove 等方法
    //   此种情况不可能对数组项内部值做改动，因此无需重置 key，沿用之前的就行
    // 2.更新操作是由外部触发，比如在外部组件调用 form.dispatchValue(name, [...])
    //   此种情况必须重置 key，让组件重新渲染
    if (!internalOperate.current) {
      keyManager.current.keys = [];
    } else {
      internalOperate.current = false;
    }

    setSignature((p) => p + 1);
  }, []);

  useFieldsChange(handleDependenciesChange, dependencies, { dynamic: true, immediate: true });

  useImperativeHandle(ref, () => ({
    add: handleAdd,
    remove: handleRemove,
    move: handleMove,
    unshift: handleUnshift,
  }));

  if (props.name === undefined) {
    return <>{content}</>;
  }

  return (
    <FormAccess name={name}>
      {content}
    </FormAccess>
  );
}

type IFormList = <T extends Store = Store>(
  props: FormListProps<T> & RefAttributes<IFormListOperators<T>>
) => JSX.Element;

export default React.forwardRef(FormList) as IFormList;
