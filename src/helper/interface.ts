import { FormListProps } from '../FormList';

export interface Store<T = any> {
  [p: string]: T;
}

export interface ListProps<V, P> {
  listProps?: Omit<FormListProps<V>, 'children'>;
  itemProps?: P;
}
