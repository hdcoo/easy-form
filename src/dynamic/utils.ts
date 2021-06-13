import {
  Decorator,
  LeafSpecificProperties,
  RenderItem,
  RenderProperty,
  UnderlyingProperty
} from "./types";

export function isNil(t: any): t is null | undefined {
  return t === null || t === undefined;
}

export function isRenderCustom(p: any): p is UnderlyingProperty<'render'> & RenderItem {
  return isRenderProperty(p) && typeof (p as RenderItem).render === 'function';
}

export function isRenderProperty(p: any): p is RenderProperty {
  return (p as RenderProperty).type === 'render';
}

export function isLeafSpecificProperty(p: any): p is LeafSpecificProperties {
  return typeof (p as LeafSpecificProperties).name === 'string' || isRenderProperty(p);
}

export function filterDecorators(decorators: Array<Decorator | boolean | '' | undefined>) {
  return decorators.filter((d) => typeof d === 'function') as Decorator[];
}
