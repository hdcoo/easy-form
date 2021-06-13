import React from "react";
import {
  ComponentMap,
  Config,
  LeafProperties,
  LeafSpecificProperties,
  Properties,
  PropertiesFromComponentMap,
  SpecificProperties,
  SpecificPropertiesFromComponentMap
} from './types';
import {FormLevelConfig} from '../createForm';
import SlotsContainer from './components/SlotsContainer';
import {createForm, createList, createListFactory} from '..';
import formAccess from "./hoc/formAccess";
import {filterDecorators, isRenderCustom} from "./utils";
import {Cascader, Checkbox, Input, Radio, Rate, Select, Slider, Switch, Transfer, TreeSelect, Typography} from "antd";
import DatePicker from "./components/DatePicker";
import TimePicker, {TimeRangePicker} from "./components/TimePicker";
import autoFormItem from "./hoc/autoFormItem";
import PropsTunnel from "./components/PropsTunnel";

function notFoundRender(type: any) {
  return (
    <Typography.Paragraph
      type="danger"
      style={{margin: 0}}
    >
      Unknown property type: "{type}"
    </Typography.Paragraph>
  )
}

/**
 * Handle the leaf properties.
 * Include base property types such as input, select, etc...
 * Also include render property and the customized property.
 * */
function handleLeafProperty<T extends ComponentMap>(
  property: LeafProperties | LeafSpecificProperties | PropertiesFromComponentMap<T>,
  customization?: ComponentMap,
) {
  const internalProperty = property as LeafProperties | LeafSpecificProperties;
  const config: FormLevelConfig = {
    component: () => notFoundRender(property.type),
    decorators: property.decorators || []
  };

  switch (internalProperty.type) {
    case "input": config.component = Input;break;
    case "select": config.component = Select;break;
    case "select.tree": config.component = TreeSelect;break;
    case "cascader": config.component = Cascader as unknown as React.ComponentType;break;
    case "checkbox":config.component = Checkbox;break;
    case "picker.date": config.component = DatePicker;break;
    case "picker.date.range": config.component = DatePicker.RangePicker;break;
    case "picker.time": config.component = TimePicker;break;
    case "picker.time.range": config.component = TimeRangePicker;break;
    case "radio": config.component = Radio;break;
    case "rate": config.component = Rate;break;
    case "slider": config.component = Slider;break;
    case "switch": config.component = Switch;break;
    case "transfer": config.component = Transfer as unknown as React.ComponentType;break;
    case "render":
      if (isRenderCustom(internalProperty)) {
        config.component = (props) => <>{internalProperty.render(props)}</>;
        config.component.displayName = 'CustomRender';
      } else {
        config.component = internalProperty.component;
      }
      break;
    default:
      config.component = customization?.[property.type] || config.component;
  }

  if (property.label || property.itemProps) {
    config.decorators?.push(
      autoFormItem(
        {
          ...property.itemProps,
          name: (property as any).name,
          label: property.label,
        },
        (property as any).props
      )
    );
  }

  return config;
}

/**
 * Handle the unspecific property.Return structure for createForm
 * */
function handleProperty<T extends ComponentMap>(
  property: Properties<T> | PropertiesFromComponentMap<T>,
  customization?: ComponentMap,
): FormLevelConfig {
  const internalProperty = property as Properties<T>;
  const {decorators = [], itemProps, label} = internalProperty;

  switch (internalProperty.type) {
    case "array": return {
      component: PropsTunnel,
      decorators: filterDecorators([
        ...decorators,
        (itemProps || label) && autoFormItem({...itemProps, label}),
        internalProperty.renderer ? createListFactory(internalProperty.renderer) : createList
      ]),
      dependencies: [handleProperty(internalProperty.item)]
    };
    case "object": return {
      component: SlotsContainer,
      decorators: filterDecorators([
        ...decorators,
        (itemProps || label) && autoFormItem({...itemProps, label}),
      ]),
      dependencies: internalProperty.properties.map((p) => {
        return handleSpecificProperty(p, customization);
      }),
    };
    default: return handleLeafProperty(internalProperty, customization);
  }
}

/**
 * Handle the specific property.Return structure for createForm
 * */
function handleSpecificProperty<T extends ComponentMap>(
  property: SpecificProperties<T> | SpecificPropertiesFromComponentMap<T>,
  customization?: ComponentMap,
): FormLevelConfig {
  const internalProperty = property as SpecificProperties<T>;
  const {decorators = [], itemProps, label} = internalProperty;

  switch (internalProperty.type) {
    case 'array': return {
      component: PropsTunnel,
      decorators: filterDecorators([
        ...decorators,
        formAccess(internalProperty.name),
        (itemProps || label) && autoFormItem({...itemProps, label}),
        internalProperty.renderer ? createListFactory(internalProperty.renderer) : createList
      ]),
      dependencies: [handleProperty(internalProperty.item, customization)]
    };
    case "object": return {
      component: SlotsContainer,
      decorators: filterDecorators([
        ...decorators,
        internalProperty.name && formAccess(internalProperty.name),
        (itemProps || label) && autoFormItem({...itemProps, label}),
      ]),
      dependencies: internalProperty.properties.map((p) => {
        return handleLeafProperty(p as PropertiesFromComponentMap<T>, customization);
      }),
    };
    default: return handleLeafProperty(internalProperty, customization);
  }
}

/**
 * Return a Component which render the form.
 * */
function create<T extends ComponentMap>(config: Config<T>) {
  const _config = {
    component: SlotsContainer,
    decorators: config.decorators,
    dependencies: config.properties.map((p) => {
      return handleSpecificProperty(p, config.customization);
    }),
  };

  return createForm({
    entry: _config,
  });
}

export default create;
