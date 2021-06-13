import React from 'react';
import { Cascader, Checkbox, Input, Radio, Rate, Select, Slider, Switch, Transfer, TreeSelect } from 'antd';
import DatePicker from './components/DatePicker';
import TimePicker, { TimeRangePicker } from './components/TimePicker';
import { AutoFormItemProps } from "./components/AutoFormItem";
import { IListCreatorFactoryRenderer } from "..";

export type Decorator<T = any> = (C: React.ComponentType<T>) => React.ComponentType<T>;

export interface UnderlyingProperty<T> {
  label?: string;
  type: T;
  itemProps?: Omit<AutoFormItemProps<any>, 'name' | 'label'>;
  decorators?: Array<(C: React.ComponentType<any>) => React.ComponentType<any>>;
}

interface LeafProperty<T, Props> extends UnderlyingProperty<T> {
  props?: Props;
}

export interface PropertySpecific {
  name: string;
}

// 工具类型，获取组件 props、遍历组件集合
type MappedToUnion<T> = T[keyof T];

export type ComponentMap = {
  [p: string]: React.ComponentType<any>;
}

type ExtractComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

type PropertyMapFromComponentMap<T> = {
  [P in keyof T]: LeafProperty<P, ExtractComponentProps<T[P]>>
}

type SpecificPropertyMapFromComponentMap<T> = {
  [P in keyof T]: LeafProperty<P, ExtractComponentProps<T[P]>> & PropertySpecific;
}

// 获取属性联合类型
export type PropertiesFromComponentMap<T> = MappedToUnion<PropertyMapFromComponentMap<T>>;

export type SpecificPropertiesFromComponentMap<T> = MappedToUnion<SpecificPropertyMapFromComponentMap<T>>;

// 内置组件
interface InternalComponents {
  input: typeof Input;
  select: typeof Select;
  'select.tree': typeof TreeSelect;
  cascader: typeof Cascader;
  checkbox: typeof Checkbox;
  radio: typeof Radio;
  slider: typeof Slider;
  rate: typeof Rate;
  switch: typeof Switch;
  'picker.date': typeof DatePicker;
  'picker.time': typeof TimePicker;
  'picker.date.range': typeof DatePicker.RangePicker;
  'picker.time.range': typeof TimeRangePicker;
  transfer: typeof Transfer;
}

// 内置属性类型
export type BasePropertyTypes = keyof InternalComponents;

export type StructurePropertyTypes = 'object' | 'array';

export type PropertyTypes = BasePropertyTypes | StructurePropertyTypes;

// 特殊属性类型定义
export interface ObjectProperty<T extends ComponentMap> extends UnderlyingProperty<'object'> {
  name?: string;
  properties: Array<SpecificProperties<T> | SpecificPropertiesFromComponentMap<T>>;
}

interface ArrayItem<T extends ComponentMap> {
  item: BaseProperties | RenderProperty | ObjectProperty<T> | PropertiesFromComponentMap<T>;
  renderer?: IListCreatorFactoryRenderer<any>;
}

export type ArrayProperty<T extends ComponentMap> = UnderlyingProperty<'array'> & PropertySpecific & ArrayItem<T>

interface FormItemChildProps {
  value?: any;
  onChange?(value: any): void;
}

export interface ComponentItem {
  component: React.ComponentType<FormItemChildProps>;
}

export interface RenderItem {
  render(props?: FormItemChildProps): React.ReactNode;
}

export type RenderProperty = UnderlyingProperty<'render'> & (ComponentItem | RenderItem) & Partial<PropertySpecific>;


// 属性集合定义
export type BaseProperties = PropertiesFromComponentMap<InternalComponents>;

export type BaseSpecificProperties = SpecificPropertiesFromComponentMap<InternalComponents>;

export type LeafProperties = BaseProperties | RenderProperty;

export type LeafSpecificProperties = BaseSpecificProperties | RenderProperty;

export type StructureProperties<T extends ComponentMap> = ObjectProperty<T> | ArrayProperty<T>;

export type Properties<T extends ComponentMap> = LeafProperties | StructureProperties<T>;

export type SpecificProperties<T extends ComponentMap> = LeafSpecificProperties | StructureProperties<T>;

export interface Config<T extends ComponentMap> {
  properties: Array<SpecificProperties<T> | SpecificPropertiesFromComponentMap<T>>;
  decorators?: Array<(C: React.ComponentType<any>) => React.ComponentType<any>>;
  customization?: T;
}
