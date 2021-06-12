import { InternalFormInstance, InternalHooks, InternalNamePath, Meta, NamePath } from 'rc-field-form/es/interface';
import { HOOK_MARK, valueUtil } from '../helper/rcForm';
import { FormInstance } from 'antd/es/form';
import { Store } from '../helper/interface';

type InternalForm = Pick<FormInstance, 'getFieldsValue' | 'getFieldValue' | 'validateFields' | 'resetFields' | 'setFieldsValue'>;

export interface ILocalFormInstance extends InternalForm {
  dispatchValue: (name: NamePath, value?: any) => void;
  namePath: InternalNamePath;
}

function mergePrefixName(prefixName: InternalNamePath, nameList: NamePath[]): InternalNamePath[] {
  return nameList.map((name) => [...prefixName, ...getNamePath(name)]);
}

const { getNamePath, getValue, setValues } = valueUtil;

export default function getLocalForm(
  originForm: InternalFormInstance,
  prefixPath: InternalNamePath = [],
  basePath?: NamePath,
): ILocalFormInstance {
  const fullPrefix = [...prefixPath, ...getNamePath(basePath ?? [])];

  function getLocalNameList() {
    const hooks = originForm.getInternalHooks(HOOK_MARK) as InternalHooks;
    const fields = hooks.getFields();

    return fields.reduce((acc: InternalNamePath[], field) => {
      const { name } = field;

      if (!Array.isArray(name) || name.length < fullPrefix.length) {
        return acc;
      }

      if (fullPrefix.every((prefix, i) => prefix === name[i])) {
        acc.push(name);
      }

      return acc;
    }, []);
  }

  /**
   * 获取本地数据 同 getFieldValue
   * */
  function getLocalFieldValue(name: NamePath) {
    return originForm.getFieldValue([...fullPrefix, ...getNamePath(name)]);
  }

  /**
   * 批量获取本地数据，同 getFieldsValue
   * */
  function getLocalFieldsValue(
    nameList?: NamePath[] | true,
    filterFunc?: (meta: Meta) => boolean,
  ) {
    if (!nameList || nameList === true) {
      const value = originForm.getFieldsValue([fullPrefix], filterFunc);
      return getValue(value, fullPrefix);
    }

    const value = originForm.getFieldsValue(mergePrefixName(fullPrefix, nameList), filterFunc);
    return getValue(value, fullPrefix);
  }

  /**
   * 设置本地数据，同 setFieldsValue
   * */
  function setLocalFieldsValue(value: Store) {
    const hooks = originForm.getInternalHooks(HOOK_MARK) as InternalHooks;
    const localValue = originForm.getFieldValue(fullPrefix);
    const mergedValue = Array.isArray(value) ? value : setValues(localValue, value);

    return hooks.dispatch({
      type: 'updateValue',
      namePath: fullPrefix,
      value: mergedValue,
    });
  }

  /**
   * 校验本地数据，同 validateFields
   * */
  function validateLocalFields(nameList?: NamePath[]) {
    if (!fullPrefix.length) {
      return originForm.validateFields(nameList);
    }

    if (nameList && nameList.length > 0) {
      return originForm.validateFields(mergePrefixName(fullPrefix, nameList));
    }

    return originForm.validateFields(getLocalNameList());
  }

  /**
   * 重置本地数据，同 resetFields
   * */
  function resetLocalFields(fields?: NamePath[]) {
    if (fields && fields.length > 0) {
      return originForm.resetFields(mergePrefixName(fullPrefix, fields));
    }

    return originForm.resetFields([fullPrefix]);
  }

  /**
   * 内部方法，与组件调用 onChange 相同的效果
   * */
  function dispatch(name: NamePath, value?: any) {
    const hooks = originForm.getInternalHooks(HOOK_MARK) as InternalHooks;
    hooks.dispatch({
      type: 'updateValue',
      namePath: [...fullPrefix, ...getNamePath(name)],
      value,
    });
  }

  return {
    getFieldValue: getLocalFieldValue,
    getFieldsValue: getLocalFieldsValue,
    setFieldsValue: setLocalFieldsValue,
    resetFields: resetLocalFields,
    validateFields: validateLocalFields,
    dispatchValue: dispatch,
    namePath: fullPrefix.slice(),
  };
}
