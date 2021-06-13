import React, { useMemo } from 'react';
import { Form, FormItemProps } from 'antd';
import { useFieldsValue } from '../..';
import FormValueView from './FormValueView';
import { isNil } from '../utils';

export interface AutoFormItemProps<T> extends FormItemProps {
  listener?: string | number | Array<string | number>;
  formatter?: (value?: T) => React.ReactNode;
}

function AutoFormItem<T>(props: AutoFormItemProps<T>) {
  const { children, formatter, name, listener, ...rest } = props;
  const names = useMemo(() => [listener || '_editable_'], [listener]);

  const [isEditing] = useFieldsValue<[boolean | undefined]>({
    names,
    mode: 'global',
    dynamic: true,
  });

  const hasName = useMemo(() => {
    return !isNil(name);
  }, [name]);

  const safeChildren = useMemo(() => {
    return !hasName || React.isValidElement(children) ? children : <></>;
  }, [children, hasName]);

  return (
    <Form.Item name={name} {...rest}>
      {!hasName || isEditing ? safeChildren : <FormValueView formatter={formatter} />}
    </Form.Item>
  );
}

export default AutoFormItem;
