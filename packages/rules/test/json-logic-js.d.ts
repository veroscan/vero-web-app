declare module 'json-logic-js' {
  const jsonLogic: {
    apply(logic: unknown, data?: unknown): unknown;
    truthy(value: unknown): boolean;
  };
  export default jsonLogic;
}
