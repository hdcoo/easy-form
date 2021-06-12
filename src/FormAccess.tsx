import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { FieldContext, valueUtil } from './helper/rcForm';
import { NamePath } from 'rc-field-form/es/interface';

interface FormAccessProps {
  name: NamePath;
}

const { getNamePath } = valueUtil;

const FormAccess = (props: PropsWithChildren<FormAccessProps>) => {
  const { name, children } = props;
  const context = useContext(FieldContext);
  const value = useMemo(() => {
    return {
      ...context,
      prefixName: [
        ...(context.prefixName || []),
        ...getNamePath(name),
      ],
    };
  }, [context, name]);

  return (
    <FieldContext.Provider value={value}>
      {children}
    </FieldContext.Provider>
  );
};

export default FormAccess;
