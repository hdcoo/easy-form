import { useCallback, useContext, useMemo } from 'react';
import { FieldContext } from './helper/rcForm';
import { FormInstance } from 'antd/es/form';
import { NamePath } from 'rc-field-form/es/interface';
import getLocalForm from './core/localForm';
import { lookUpward } from './helper/utils';

export interface UseLocalFormProps {
  basePath?: NamePath;
  upward?: number;
  mode?: 'global' | 'local';
}

export type GlobalForm = Omit<FormInstance, 'scrollToField' | 'getFieldInstance' | '__INTERNAL__'>;

function useLocalForm(
  props?: UseLocalFormProps,
) {
  const { basePath, mode, upward = 0 } = props || {};
  const context = useContext(FieldContext);

  const localForm = useMemo(() => {
    return getLocalForm(
      context,
      mode === 'global' ? [] : lookUpward(context.prefixName || [], upward),
      basePath,
    );
  }, [basePath, context, mode, upward]);

  const getForm = useCallback((options?: UseLocalFormProps) => {
    return getLocalForm(
      context,
      options?.mode === 'global'
        ? []
        : lookUpward(context.prefixName || [], options?.upward ?? upward),
      options?.basePath,
    );
  }, [context, upward]);

  return [localForm, context as GlobalForm, getForm] as const;
}

export default useLocalForm;
