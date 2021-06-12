import React, { useCallback, useRef } from 'react';
import FormList, { IFormListOperators, IFieldInfo } from './FormList';
import FormAccess from './FormAccess';
import { ListProps } from './helper/interface';

export interface IListeners<V> {
  onAdd: (initialValue?: V) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
  onUnshift: (initialValue?: V) => void;
}

export interface IOuterListeners<V> {
  onAdd: (initialValue: V | undefined, _: IFormListOperators<V>) => void;
  onMove: (from: number, to: number, _: IFormListOperators<V>) => void;
  onRemove: (i: number, _: IFormListOperators<V>) => void;
  onUnshift: (initialValue: V | undefined, _: IFormListOperators<V>) => void;
}

export interface IListItemExtraProps<V> extends IListeners<V> {
  index: number;
  total: number;
}

function createList<V, P>(
  ListItem: React.ComponentType<IListItemExtraProps<V> & P>,
  initialValue?: V,
) {
  function CreateList(
    props: ListProps<V, P> & Partial<IOuterListeners<V>>,
    ref: React.Ref<IFormListOperators<V>>,
  ) {
    const { itemProps, listProps, onAdd, onMove, onRemove, onUnshift } = props;
    const operators = useRef<IFormListOperators<V>>();

    const handleAdd = useCallback((_initialValue?: V) => {
      const _ = _initialValue ?? initialValue;
      if (operators.current) {
        onAdd ? onAdd(_, operators.current) : operators.current.add(_);
      }
    }, [onAdd]);

    const handleUnshift = useCallback((_initialValue?: V) => {
      const _ = _initialValue ?? initialValue;
      if (operators.current) {
        onUnshift ? onUnshift(_, operators.current) : operators.current.unshift(_);
      }
    }, [onUnshift]);

    const handleRemove = useCallback((index: number) => {
      if (operators.current) {
        onRemove ? onRemove(index, operators.current) : operators.current.remove(index);
      }
    }, [onRemove]);

    const handleMove = useCallback((from: number, to: number) => {
      if (operators.current) {
        onMove ? onMove(from, to, operators.current) : operators.current.move(from, to);
      }
    }, [onMove]);

    const renderer = useCallback((
      fields: Array<IFieldInfo<V>>,
      _operators: IFormListOperators<V>,
    ) => {
      operators.current = _operators;

      return (
        <>
          {fields.map((field, index) => (
            <FormAccess
              key={field.key}
              name={index}
            >
              <ListItem
                index={index}
                total={fields.length}
                onRemove={handleRemove}
                onAdd={handleAdd}
                onMove={handleMove}
                onUnshift={handleUnshift}
                {...itemProps as P}
              />
            </FormAccess>
          ))}
        </>
      );
    }, [handleAdd, handleMove, handleRemove, handleUnshift, itemProps]);

    return (
      <FormList
        ref={ref}
        {...listProps}
      >
        {renderer}
      </FormList>
    );
  }

  return React.forwardRef<
  IFormListOperators<V>,
  ListProps<V, P> & Partial<IListeners<V>>
  >(CreateList);
}

export default createList;
