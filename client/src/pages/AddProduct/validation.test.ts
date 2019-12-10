import * as Yup from "yup";
import { object, TestContext } from "yup";

function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
type PromisesMap<T> = { [P in keyof T]: Promise<T[P]> };
function promiseAllProperties<T>(promisesMap: PromisesMap<T>): Promise<T> {
  if (promisesMap === null || typeof promisesMap !== "object") {
    return Promise.reject(
      new TypeError("The input argument must be of type Object")
    );
  }

  const keys = Object.keys(promisesMap);
  const promises = keys.map(key => {
    return (promisesMap as any)[key];
  });

  return Promise.all(promises).then(results => {
    return results.reduce((resolved, result, index) => {
      resolved[keys[index]] = result;
      return resolved;
    }, {});
  });
}
it("should asdf", async function() {
  type FieldValidator = (value: string) => Promise<void>;
  const f1: FieldValidator = async value => {
    throw "not it";
  };
  type ObjectValidator<T extends { [_: string]: string }> = (
    value: T
  ) => { [_: string]: Promise<string | void> };
  function createObjectValidator<T extends { [_: string]: FieldValidator }>(
    s: T
  ): ObjectValidator<{ [P in keyof T]: string }> {
    return p => {
      let map = Object.fromEntries(
        Object.entries(s).map(([key, value]) => {
          return [key, value(p[key]).catch((r: string) => r)];
        })
      );
      return (promiseAllProperties(map) as unknown) as {
        [_: string]: Promise<string | void>;
      };
    };
  }

  let newVar = await createObjectValidator({ a: f1 })({ a: "1" });
  expect(newVar).toEqual({ a: "not it" });
});
export default {};
