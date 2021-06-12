import React from 'react';

function inject<P>(
  C: React.ComponentType<P>,
  slots: Array<React.ComponentType<any>> = [],
  slotsPropName = 'formSlots',
) {
  function Inject(props: P, ref: React.Ref<any>) {
    return React.createElement(C, {
      ...props,
      ref,
      [slotsPropName]: slots,
    });
  }

  (Inject as React.FunctionComponent).displayName = `${C.displayName || ''}Inject`;

  return React.forwardRef(Inject);
}

export default inject;
