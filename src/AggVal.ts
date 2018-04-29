export type AggVal<T> = {
  val: T;
  // Nulled = true means the value is ignored and will not be pushed through following Modifiers
  // A modifier can return { ...otherProps, nulled: true } to signal that the value should
  // be thrown. For example, filter can be implemented as such:
  // const filter = predicate => value => {...value, nulled: predicate(value.val)}
  nulled: boolean;
  props: {[k: string]: any};
};
