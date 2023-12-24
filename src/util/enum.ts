// EWWWWWWWWWWW
export default function Enum(
  baseEnum: { [key: string]: any },
  type: any,
  ...args: any[]
) {
  return new Proxy(baseEnum, {
    get(target, key, receiver) {
      if (!baseEnum.hasOwnProperty(key)) {
        throw new Error(`"${String(key)}" value does not exist in the enum`);
      }
      return new type(Reflect.get(target, key, receiver), ...args);
    },
    set(target, key, receiver) {
      throw new Error("Cannot add a new value to the enum");
    },
  });
}
