import React from "react";
import {FormAccess} from "../..";

function formAccess(name: string | number | Array<string | number>) {
  return function formAccessHOC(C: React.ComponentType<any>) {
    function FormAccessHOC(props: any, ref: React.Ref<any>): JSX.Element {
      return (
        <FormAccess name={name}>
          <C ref={ref} {...props} />
        </FormAccess>
      )
    }

    return React.forwardRef(FormAccessHOC);
  }
}

export default formAccess;
