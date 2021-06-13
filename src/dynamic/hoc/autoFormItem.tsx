import React from "react";
import {isNil} from "../utils";
import AutoFormItem, {AutoFormItemProps} from "../components/AutoFormItem";

function autoFormItem(itemProps?: AutoFormItemProps<any>, defaultProps?: any) {
  return function autoFormItemHOC(C: React.ComponentType) {
    return function AutoFormItemHOC(props: any): JSX.Element {
      if (!itemProps || (isNil(itemProps.name) && isNil(itemProps.label))) {
        return <C {...props} />
      }

      return (
        <AutoFormItem {...itemProps}>
          <C {...defaultProps} {...props} />
        </AutoFormItem>
      )
    }
  }
}

export default autoFormItem;
