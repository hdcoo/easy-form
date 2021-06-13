import React from 'react';
import createListFactory from "./createListFactory";

const createList = createListFactory<any>((fields, renderChild) => (
  <>{fields.map(renderChild)}</>
));

export default createList;
