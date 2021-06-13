import React from 'react';

interface SlotsContainerProps {
  formSlots?: React.ComponentType[];
}

const SlotsContainer = (props: SlotsContainerProps) => {
  const { formSlots = [] } = props;

  return (
    <>
      {formSlots.map((C, i) => C && <C key={i} />)}
    </>
  );
};

export default SlotsContainer;
