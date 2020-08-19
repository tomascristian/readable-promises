const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

export default function newPromise(executor) {
  let state = PENDING; // Can only transition (settle) to fulfilled or rejected
  let result; // Fulfilllment value or rejection reason
  let onFulfilledTasks = [];
  let onRejectedTasks = [];

  const promiseInstance = {
    then,
    catch: (onRejected) => then(null, onRejected)
  };

  try {
    executor(resolve, reject); // Executor runs synchronously on creation
  } catch (error) {
    reject(error); // Executor is throw safe (no need for try catch inside)
  }

  return promiseInstance;

  function fulfill(value) {
    if (state !== PENDING) return; // 2.1.2.1 (Can't change state once settled)
    state = FULFILLED;
    result = value;
    onFulfilledTasks.forEach(queueMicrotask);
  }

  function reject(reason) {
    if (state !== PENDING) return;
    state = REJECTED;
    result = reason;
    onRejectedTasks.forEach(queueMicrotask);
  }

  function resolve(value) {
    if (isPrimitive(value)) {
      fulfill(value);
    } else {
      tryResolvingWithThenable(value);
    }
  }

  function tryResolvingWithThenable(obj) {
    if (obj === promiseInstance) {
      reject(TypeError("Can't resolve with itself.")); // 2.3.1 (infinite loop)
      return;
    }

    let then;
    try { // 2.3.3.2 (if obj.then is a getter it could throw)
      then = obj.then;
    } catch (e) {
      reject(e);
      return;
    }
    const isThenable = typeof then === "function";
    if (isThenable) {
      followThenable();
    } else {
      fulfill(obj);
    }

    // Remain pending and adopt the thenable's (eventual) resolution value
    function followThenable() {
      let alreadyCalled = false;
      const once = (fn) => (arg) => { // 2.3.3.3.3 (ignore calls after first)
        if (alreadyCalled) return;
        fn(arg);
        alreadyCalled = true;
      };
      queueMicrotask(() => { // Following a thenable is non-blocking
        try {
          // 2.3.3.3 (use .call to avoid GET operation)
          then.call(obj, once(resolve), once(reject));
        } catch (e) {
          once(reject)(e);
        }
      });
    }
  }

  function then(onFulfilled, onRejected) {
    return newPromise((resolveNewPromise, rejectNewPromise) => {
      // Default to passing the value or reason forward
      if (typeof onFulfilled !== "function") onFulfilled = (x) => x;
      if (typeof onRejected !== "function") onRejected = (x) => { throw x; };

      switch (state) {
        case PENDING:
          onFulfilledTasks.push(newTask(onFulfilled));
          onRejectedTasks.push(newTask(onRejected));
          break;
        case FULFILLED:
          queueMicrotask(newTask(onFulfilled));
          break;
        case REJECTED:
          queueMicrotask(newTask(onRejected));
          break;
        default: // Nothing (state is an enum)
      }

      function newTask(handler) {
        return () => {
          try {
            const previousPromiseResult = result; // Rename for clarity
            resolveNewPromise(handler(previousPromiseResult));
          } catch (e) {
            rejectNewPromise(e);
          }
        };
      }
    });
  }
}

function isPrimitive(value) {
  const type = typeof value;
  return (value === null) || (type !== "object" && type !== "function");
}
