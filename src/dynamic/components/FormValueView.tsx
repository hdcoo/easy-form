import React from 'react';

export interface FormValueViewProps<V> {
  value?: V;
  formatter?: (value?: V) => React.ReactNode;
  children?: (value?: V) => React.ReactNode;
}

function FormValueView<V>(props: FormValueViewProps<V>) {
  const { children, formatter, value } = props;
  let content;

  if (children) {
    content = children(value);
  } else if (formatter) {
    content = formatter(value);
  } else {
    content = value;
  }

  return <>{content}</>;
}

export default FormValueView;
