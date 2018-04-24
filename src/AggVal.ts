export type AggVal<T> = {
  val: T;
  nulled: boolean;
  props: {[k: string]: any};
};
