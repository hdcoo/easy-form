import React from "react";

interface PropsTunnelProps {
  formSlots?: React.ComponentType[];
}

const PropsTunnel = (props: PropsTunnelProps) => {
  const {formSlots = [], ...rest} = props;
  const [Slot] = formSlots;

  return (
    <>
      {Slot && <Slot {...rest} />}
    </>
  )
}

export default PropsTunnel
