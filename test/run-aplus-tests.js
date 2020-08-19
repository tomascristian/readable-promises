import promisesAplusTests from "promises-aplus-tests";
import Promise from "../src/Promise.js";

const adapter = {
  deferred() {
    const obj = {};
    obj.promise = Promise((resolve, reject) => {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    return obj;
  }
};

const mochaOptions = {
  bail: true
};

promisesAplusTests(adapter, mochaOptions, (err) => {
  // All done; output is in the console. Or check `err` for number of failures.
});
