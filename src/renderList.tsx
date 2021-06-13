import React, { useCallback } from 'react';
import FormList, { IFieldInfo, IFormListOperators } from './FormList';
import { ListProps } from './helper/interface';

export type IListRenderer<V, P> = (
  fields: Array<IFieldInfo<V>>,
  operations: IFormListOperators<V>,
  itemProps?: P
) => React.ReactNode;

function renderList<V, P>(renderer: IListRenderer<V, P>) {
  function RenderList(
    props: ListProps<V, P>,
    ref: React.Ref<IFormListOperators<V>>,
  ) {
    const { listProps, itemProps } = props;

    const listRenderer = useCallback((
      fields: Array<IFieldInfo<V>>,
      operations: IFormListOperators<V>,
    ) => {
      return renderer(fields, operations, itemProps);
    }, [itemProps]);

    return (
      <FormList
        ref={ref}
        {...listProps}
      >
        {listRenderer}
      </FormList>
    );
  }

  return React.forwardRef<IFormListOperators<V>, ListProps<V, P>>(RenderList);
}

export default renderList;
