import React, { ComponentType } from 'react';
import { flowRight, isNumber, isPlainObject, isString } from './helper/utils';
import inject from './inject';

type Component = React.ComponentType<any>;
type NameConstraint = string | number;

export interface FormLevelConfig {
  component: Component | string;
  /**
   * 组件内部承载 slots 的 prop 名称，默认叫 formSlots
   * */
  slotsPropName?: string;
  /**
   * 依赖名称集合
   * */
  dependencies?: Array<string | React.ComponentType<any> | FormLevelConfig | NamedFormLevelConfig>;
  decorators?: Array<(C: Component) => Component>;
}

export interface NamedFormLevelConfig extends FormLevelConfig {
  name: NameConstraint;
}

interface DependencyInfo {
  traveled: boolean;
  component?: React.ComponentType;
}

interface FormConfig {
  entry: FormLevelConfig | NameConstraint;
  slotsPropName?: string;
  modules?: NamedFormLevelConfig[];
}

function createForm(config: FormConfig) {
  const { entry, slotsPropName, modules = [] } = config;
  const dependenciesMap = new Map<NameConstraint, DependencyInfo>(modules.map((level) => {
    return [level.name, { traveled: false }];
  }));
  const entryConfig = isString(entry) || isNumber(entry)
    ? modules.find((level) => level.name === entry)
    : { ...(entry as FormLevelConfig), name: null };

  function findConfig(depName: string) {
    return modules.find((level) => level.name === depName);
  }

  function getComponent(c: string | ComponentType) {
    if (typeof c === 'string') {
      const conf = findConfig(c);

      return conf ? create(conf) : () => null;
    }

    return c;
  }

  function create(levelConfig: NamedFormLevelConfig | FormLevelConfig) {
    let dependencyInfo: DependencyInfo | undefined;
    let result: React.ComponentType;
    const { decorators = [], dependencies, component, slotsPropName: _s } = levelConfig;
    const { name } = levelConfig as NamedFormLevelConfig;
    const Component = getComponent(component);

    if (isString(name) || isNumber(name)) {
      dependencyInfo = dependenciesMap.get(name);

      if (!dependencyInfo) {
        throw new Error('Something went wrong.');
      }

      if (dependencyInfo.component) {
        return dependencyInfo.component;
      }

      if (dependencyInfo.traveled) {
        throw new Error('检测到循环引用，请检查 createForm 配置！');
      }

      dependencyInfo.traveled = true;
    }

    if (!dependencies) {
      result = flowRight(decorators)(Component);
    } else {
      const slots = dependencies.map((depName) => {
        if (typeof depName === 'function') {
          return depName;
        }

        let targetConfig: NamedFormLevelConfig | FormLevelConfig | undefined;

        if (typeof depName === 'string') {
          targetConfig = findConfig(depName);
        } else if (isPlainObject(depName)) {
          const { name: n, ...rest } = depName as NamedFormLevelConfig; // 去除 name 属性，跳过循环检测
          targetConfig = rest;
        }

        if (!targetConfig) {
          return () => null;
        }

        return create(targetConfig);
      });

      result = flowRight(decorators)(inject(Component, slots, _s || slotsPropName || undefined));
    }

    if (dependencyInfo) {
      dependencyInfo.component = result;
    }

    return result;
  }

  return entryConfig ? create(entryConfig) : () => null;
}

export default createForm;
