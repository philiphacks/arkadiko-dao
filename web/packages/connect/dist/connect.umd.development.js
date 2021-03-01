(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@stacks/auth'), require('jsontokens'), require('@stacks/transactions'), require('@stacks/network'), require('@stacks/connect-ui')) :
  typeof define === 'function' && define.amd ? define(['exports', '@stacks/auth', 'jsontokens', '@stacks/transactions', '@stacks/network', '@stacks/connect-ui'], factory) :
  (global = global || self, factory(global['@stacks/connect'] = {}, global.auth, global.jsontokens, global.transactions, global.network, global.connectUi));
}(this, (function (exports, auth, jsontokens, transactions, network, connectUi) { 'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var runtime_1 = /*#__PURE__*/createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          prototype[method] = function (arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;

          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports );

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  // Width 2px wider than in-page dialog.
  // Ensures retina subpixel rounding
  // does not leave slightly blurry underlap
  var defaultWidth = 442;
  var defaultHeight = 580;
  var defaultTitle = 'Stacks Wallet'; // https://developer.mozilla.org/en-US/docs/Web/API/Window/open

  var popupCenter = function popupCenter(_ref) {
    var url = _ref.url,
        _ref$title = _ref.title,
        title = _ref$title === void 0 ? defaultTitle : _ref$title,
        _ref$w = _ref.w,
        w = _ref$w === void 0 ? defaultWidth : _ref$w,
        _ref$h = _ref.h,
        h = _ref$h === void 0 ? defaultHeight : _ref$h,
        _ref$skipPopupFallbac = _ref.skipPopupFallback,
        skipPopupFallback = _ref$skipPopupFallbac === void 0 ? true : _ref$skipPopupFallbac;
    var win = window; // Safari reports an incorrect browser height

    var isSafari = win.safari !== undefined;
    var browserViewport = {
      width: win.innerWidth,
      height: win.outerHeight
    };
    console.log('browser viewport', browserViewport);
    var browserToolbarHeight = win.outerHeight - win.innerHeight;
    var browserSidepanelWidth = win.outerWidth - win.innerWidth; // Such as fixed operating system UI

    var removeUnusableSpaceX = function removeUnusableSpaceX(coord) {
      return coord - (win.screen.width - win.screen.availWidth);
    };

    var removeUnusableSpaceY = function removeUnusableSpaceY(coord) {
      return coord - (win.screen.height - win.screen.availHeight);
    };

    var browserPosition = {
      x: removeUnusableSpaceX(win.screenX),
      y: removeUnusableSpaceY(win.screenY)
    };
    console.log('browserPosition', browserPosition);
    var left = browserPosition.x + browserSidepanelWidth + (browserViewport.width - w) / 2;
    var top = browserPosition.y + browserToolbarHeight + (browserViewport.height - h) / 2 + (isSafari ? 48 : 0);
    var options = {
      scrollbars: 'no',
      width: w,
      height: h,
      top: top,
      left: left
    };
    var optionsString = Object.keys(options).map(function (key) {
      return key + "=" + options[key];
    });
    var newWindow = window.open(url, title, optionsString.join(','));

    if (newWindow) {
      newWindow.focus();
      return newWindow;
    } // no popup options, just open the auth page


    if (skipPopupFallback) {
      return newWindow;
    }

    return window.open(url);
  };
  var setupListener = function setupListener(_ref2) {
    var popup = _ref2.popup,
        messageParams = _ref2.messageParams,
        onFinish = _ref2.onFinish,
        onCancel = _ref2.onCancel,
        authURL = _ref2.authURL;
    var lastPong = null; // Send a message to the authenticator popup at a consistent interval. This allows
    // the authenticator to 'respond'.

    var pingInterval = 250;
    var interval = undefined;

    var sendPing = function sendPing() {
      console.log('sending ping', popup == null ? void 0 : popup.origin);

      if (popup) {
        try {
          popup.postMessage(_extends({
            method: 'ping'
          }, messageParams), authURL.origin);
        } catch (error) {
          console.warn('[Blockstack] Unable to send ping to authentication service');
          clearInterval(interval);
        }
      } else {
        console.warn('[Blockstack] Unable to send ping to authentication service - popup closed');
      } // If we haven't received a "pong" recently, then the popup was probably closed
      // by the user. 750ms has been tested by most browsers. Most respond in less than
      // 500ms, although Safari can often take around 600-650ms.


      if (lastPong && new Date().getTime() - lastPong > pingInterval * 8) {
        onCancel && onCancel();
        clearInterval(interval);
      }
    };

    interval = window.setInterval(sendPing, pingInterval); // sendPing();

    var receiveMessage = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(event) {
        var data;
        return runtime_1.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('received a message');

                if (!(event.data.method === 'pong')) {
                  _context.next = 5;
                  break;
                }

                console.log('got pong!');
                lastPong = new Date().getTime();
                return _context.abrupt("return");

              case 5:
                if (!(event.data.source === 'blockstack-app')) {
                  _context.next = 12;
                  break;
                }

                data = event.data;
                _context.next = 9;
                return onFinish(data);

              case 9:
                window.focus();
                window.removeEventListener('message', receiveMessageCallback);
                clearInterval(interval);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function receiveMessage(_x) {
        return _ref3.apply(this, arguments);
      };
    }();

    var receiveMessageCallback = function receiveMessageCallback(event) {
      void receiveMessage(event);
    };

    window.addEventListener('message', receiveMessageCallback, false);
  };

  var version = "4.3.15";

  function getStacksProvider() {
    return window.StacksProvider || window.BlockstackProvider;
  }
  function isStacksWalletInstalled() {
    return !!getStacksProvider();
  }

  var defaultAuthURL = 'https://app.blockstack.org';

  if (typeof window !== 'undefined') {
    window.__CONNECT_VERSION__ = version;
  }

  var isMobile = function isMobile() {
    var ua = navigator.userAgent;

    if (/android/i.test(ua)) {
      return true;
    }

    if (/iPad|iPhone|iPod/.test(ua)) {
      return true;
    }

    if (/windows phone/i.test(ua)) {
      return true;
    }

    return false;
  };
  /**
   * mobile should not use a 'popup' type of window.
   */

  var shouldUsePopup = function shouldUsePopup() {
    return !isMobile();
  };
  var getOrCreateUserSession = function getOrCreateUserSession(userSession) {
    if (!userSession) {
      var appConfig = new auth.AppConfig(['store_write'], document.location.href);
      userSession = new auth.UserSession({
        appConfig: appConfig
      });
    }

    return userSession;
  };
  var authenticate = function authenticate(authOptions) {
    var provider = getStacksProvider();

    if (!provider) {
      throw new Error('Unable to authenticate without Stacks Wallet extension');
    }

    var _authOptions$redirect = authOptions.redirectTo,
        redirectTo = _authOptions$redirect === void 0 ? '/' : _authOptions$redirect,
        manifestPath = authOptions.manifestPath,
        finished = authOptions.finished,
        onFinish = authOptions.onFinish,
        onCancel = authOptions.onCancel,
        _authOptions$sendToSi = authOptions.sendToSignIn,
        sendToSignIn = _authOptions$sendToSi === void 0 ? false : _authOptions$sendToSi,
        _userSession = authOptions.userSession,
        appDetails = authOptions.appDetails;
    var userSession = getOrCreateUserSession(_userSession);

    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }

    var transitKey = userSession.generateAndStoreTransitKey();
    var authRequest = userSession.makeAuthRequest(transitKey, "" + document.location.origin + redirectTo, "" + document.location.origin + manifestPath, userSession.appConfig.scopes, undefined, undefined, {
      sendToSignIn: sendToSignIn,
      appDetails: appDetails,
      connectVersion: version
    });

    try {
      void provider.authenticationRequest(authRequest).then( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(authResponse) {
          var success;
          return runtime_1.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return userSession.handlePendingSignIn(authResponse);

                case 2:
                  success = onFinish || finished;
                  success == null ? void 0 : success({
                    authResponse: authResponse,
                    userSession: userSession
                  });

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    } catch (error) {
      onCancel == null ? void 0 : onCancel(error);
    }
  };
  function authenticateWithExtensionUrl(_ref2) {
    var extensionUrl = _ref2.extensionUrl,
        authOptions = _ref2.authOptions;
    var _authOptions$redirect2 = authOptions.redirectTo,
        redirectTo = _authOptions$redirect2 === void 0 ? '/' : _authOptions$redirect2,
        manifestPath = authOptions.manifestPath,
        finished = authOptions.finished,
        onFinish = authOptions.onFinish,
        onCancel = authOptions.onCancel,
        _authOptions$sendToSi2 = authOptions.sendToSignIn,
        sendToSignIn = _authOptions$sendToSi2 === void 0 ? false : _authOptions$sendToSi2,
        _userSession = authOptions.userSession,
        appDetails = authOptions.appDetails;
    var userSession = getOrCreateUserSession(_userSession);

    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }

    var transitKey = userSession.generateAndStoreTransitKey();
    var authRequest = userSession.makeAuthRequest(transitKey, "" + document.location.origin + redirectTo, "" + document.location.origin + manifestPath, userSession.appConfig.scopes, undefined, undefined, {
      sendToSignIn: sendToSignIn,
      appDetails: appDetails,
      connectVersion: version
    });
    var params = window.location.search.substr(1).split('&').filter(function (param) {
      return param.startsWith('utm');
    }).map(function (param) {
      return param.split('=');
    });
    var urlParams = new URLSearchParams();
    params.forEach(function (_ref3) {
      var key = _ref3[0],
          value = _ref3[1];
      return urlParams.set(key, value);
    });
    urlParams.set('authRequest', authRequest);
    var path = sendToSignIn ? 'sign-in' : 'sign-up';
    var authURL = new URL(extensionUrl);
    var url = authURL.origin + "/index.html#/" + path + "?" + urlParams.toString();

    if (shouldUsePopup()) {
      var popup = popupCenter({
        url: url,
        // If the extension is installed, dont worry about popup blocking
        // Otherwise, firefox will open the popup and a new tab.
        skipPopupFallback: true
      });
      setupAuthListener({
        popup: popup,
        authRequest: authRequest,
        onFinish: onFinish || finished,
        authURL: authURL,
        userSession: userSession,
        onCancel: onCancel
      });
      return;
    }

    document.location.href = url;
  }

  var setupAuthListener = function setupAuthListener(_ref4) {
    var popup = _ref4.popup,
        authRequest = _ref4.authRequest,
        _onFinish = _ref4.onFinish,
        onCancel = _ref4.onCancel,
        authURL = _ref4.authURL,
        userSession = _ref4.userSession;
    setupListener({
      popup: popup,
      onCancel: onCancel,
      onFinish: function () {
        var _onFinish2 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(data) {
          var authResponse;
          return runtime_1.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(data.authRequest === authRequest)) {
                    _context2.next = 6;
                    break;
                  }

                  if (!_onFinish) {
                    _context2.next = 6;
                    break;
                  }

                  authResponse = data.authResponse;
                  _context2.next = 5;
                  return userSession.handlePendingSignIn(authResponse);

                case 5:
                  _onFinish({
                    authResponse: authResponse,
                    userSession: userSession
                  });

                case 6:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function onFinish(_x2) {
          return _onFinish2.apply(this, arguments);
        }

        return onFinish;
      }(),
      messageParams: {
        authRequest: authRequest
      },
      authURL: authURL
    });
  };

  var getUserData = /*#__PURE__*/function () {
    var _ref5 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(userSession) {
      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              userSession = getOrCreateUserSession(userSession);

              if (!userSession.isUserSignedIn()) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt("return", userSession.loadUserData());

            case 3:
              if (!userSession.isSignInPending()) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt("return", userSession.handlePendingSignIn());

            case 5:
              return _context3.abrupt("return", null);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function getUserData(_x3) {
      return _ref5.apply(this, arguments);
    };
  }();

  (function (TransactionTypes) {
    TransactionTypes["ContractCall"] = "contract_call";
    TransactionTypes["ContractDeploy"] = "smart_contract";
    TransactionTypes["STXTransfer"] = "token_transfer";
  })(exports.TransactionTypes || (exports.TransactionTypes = {}));

  (function (ContractCallArgumentType) {
    ContractCallArgumentType["BUFFER"] = "buffer";
    ContractCallArgumentType["UINT"] = "uint";
    ContractCallArgumentType["INT"] = "int";
    ContractCallArgumentType["PRINCIPAL"] = "principal";
    ContractCallArgumentType["BOOL"] = "bool";
  })(exports.ContractCallArgumentType || (exports.ContractCallArgumentType = {}));

  var getUserSession = function getUserSession(_userSession) {
    var userSession = _userSession;

    if (!userSession) {
      var appConfig = new auth.AppConfig(['store_write'], document.location.href);
      userSession = new auth.UserSession({
        appConfig: appConfig
      });
    }

    return userSession;
  };

  var getKeys = function getKeys(_userSession) {
    var userSession = getUserSession(_userSession);
    var privateKey = userSession.loadUserData().appPrivateKey;
    var publicKey = jsontokens.SECP256K1Client.derivePublicKey(privateKey);
    return {
      privateKey: privateKey,
      publicKey: publicKey
    };
  };

  function getStxAddress(options) {
    var _userSession$loadUser, _chainIdToKey;

    var stxAddress = options.stxAddress,
        userSession = options.userSession,
        network = options.network;
    if (stxAddress) return stxAddress;
    if (!userSession || !network) return undefined;
    var stxAddresses = userSession == null ? void 0 : (_userSession$loadUser = userSession.loadUserData().profile) == null ? void 0 : _userSession$loadUser.stxAddress;
    var chainIdToKey = (_chainIdToKey = {}, _chainIdToKey[transactions.ChainID.Mainnet] = 'mainnet', _chainIdToKey[transactions.ChainID.Testnet] = 'testnet', _chainIdToKey);
    var address = stxAddresses == null ? void 0 : stxAddresses[chainIdToKey[network.chainId]];
    return address;
  }

  function getDefaults(options) {
    var network$1 = options.network || new network.StacksTestnet();
    var userSession = getUserSession(options.userSession);

    var defaults = _extends({}, options, {
      network: network$1,
      userSession: userSession
    });

    return _extends({
      stxAddress: getStxAddress(defaults)
    }, defaults);
  }

  var signPayload = /*#__PURE__*/function () {
    var _ref = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(payload, privateKey) {
      var postConditions, tokenSigner;
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              postConditions = payload.postConditions;

              if (postConditions && typeof postConditions[0] !== 'string') {
                postConditions = postConditions.map(function (pc) {
                  return transactions.serializePostCondition(pc).toString('hex');
                });
              }

              tokenSigner = new jsontokens.TokenSigner('ES256k', privateKey);
              return _context.abrupt("return", tokenSigner.signAsync(_extends({}, payload, {
                postConditions: postConditions
              })));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function signPayload(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var openTransactionPopup = function openTransactionPopup(_ref2) {
    var token = _ref2.token,
        options = _ref2.options;
    var provider = getStacksProvider();

    if (!provider) {
      throw new Error('Stacks Wallet not installed.');
    }

    void provider.transactionRequest(token).then(function (data) {
      var finishedCallback = options.finished || options.onFinish;
      var txRaw = data.txRaw;
      var txBuffer = Buffer.from(txRaw.replace(/^0x/, ''), 'hex');
      var stacksTransaction = transactions.deserializeTransaction(new transactions.BufferReader(txBuffer));
      finishedCallback == null ? void 0 : finishedCallback(_extends({}, data, {
        stacksTransaction: stacksTransaction
      }));
    });
    return;
  };

  var makeContractCallToken = /*#__PURE__*/function () {
    var _ref3 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(options) {
      var functionArgs, appDetails, userSession, _options, _getKeys, privateKey, publicKey, args, payload;

      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              functionArgs = options.functionArgs, appDetails = options.appDetails, userSession = options.userSession, _options = _objectWithoutPropertiesLoose(options, ["functionArgs", "appDetails", "userSession"]);
              _getKeys = getKeys(userSession), privateKey = _getKeys.privateKey, publicKey = _getKeys.publicKey;
              args = functionArgs.map(function (arg) {
                if (typeof arg === 'string') {
                  return arg;
                }

                return transactions.serializeCV(arg).toString('hex');
              });
              payload = _extends({}, _options, {
                functionArgs: args,
                txType: exports.TransactionTypes.ContractCall,
                publicKey: publicKey
              });

              if (appDetails) {
                payload.appDetails = appDetails;
              }

              return _context2.abrupt("return", signPayload(payload, privateKey));

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function makeContractCallToken(_x3) {
      return _ref3.apply(this, arguments);
    };
  }();
  var makeContractDeployToken = /*#__PURE__*/function () {
    var _ref4 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(options) {
      var appDetails, userSession, _options, _getKeys2, privateKey, publicKey, payload;

      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              appDetails = options.appDetails, userSession = options.userSession, _options = _objectWithoutPropertiesLoose(options, ["appDetails", "userSession"]);
              _getKeys2 = getKeys(userSession), privateKey = _getKeys2.privateKey, publicKey = _getKeys2.publicKey;
              payload = _extends({}, _options, {
                publicKey: publicKey,
                txType: exports.TransactionTypes.ContractDeploy
              });

              if (appDetails) {
                payload.appDetails = appDetails;
              }

              return _context3.abrupt("return", signPayload(payload, privateKey));

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function makeContractDeployToken(_x4) {
      return _ref4.apply(this, arguments);
    };
  }();
  var makeSTXTransferToken = /*#__PURE__*/function () {
    var _ref5 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee4(options) {
      var amount, appDetails, userSession, _options, _getKeys3, privateKey, publicKey, payload;

      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              amount = options.amount, appDetails = options.appDetails, userSession = options.userSession, _options = _objectWithoutPropertiesLoose(options, ["amount", "appDetails", "userSession"]);
              _getKeys3 = getKeys(userSession), privateKey = _getKeys3.privateKey, publicKey = _getKeys3.publicKey;
              payload = _extends({}, _options, {
                amount: amount.toString(10),
                publicKey: publicKey,
                txType: exports.TransactionTypes.STXTransfer
              });

              if (appDetails) {
                payload.appDetails = appDetails;
              }

              return _context4.abrupt("return", signPayload(payload, privateKey));

            case 5:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function makeSTXTransferToken(_x5) {
      return _ref5.apply(this, arguments);
    };
  }();

  function generateTokenAndOpenPopup(_x6, _x7) {
    return _generateTokenAndOpenPopup.apply(this, arguments);
  }

  function _generateTokenAndOpenPopup() {
    _generateTokenAndOpenPopup = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee8(options, makeTokenFn) {
      var token;
      return runtime_1.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return makeTokenFn(_extends({}, getDefaults(options), options));

            case 2:
              token = _context8.sent;
              return _context8.abrupt("return", openTransactionPopup({
                token: token,
                options: options
              }));

            case 4:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));
    return _generateTokenAndOpenPopup.apply(this, arguments);
  }

  var openContractCall = /*#__PURE__*/function () {
    var _ref6 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee5(options) {
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              return _context5.abrupt("return", generateTokenAndOpenPopup(options, makeContractCallToken));

            case 1:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function openContractCall(_x8) {
      return _ref6.apply(this, arguments);
    };
  }();
  var openContractDeploy = /*#__PURE__*/function () {
    var _ref7 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee6(options) {
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              return _context6.abrupt("return", generateTokenAndOpenPopup(options, makeContractDeployToken));

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function openContractDeploy(_x9) {
      return _ref7.apply(this, arguments);
    };
  }();
  var openSTXTransfer = /*#__PURE__*/function () {
    var _ref8 = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee7(options) {
      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              return _context7.abrupt("return", generateTokenAndOpenPopup(options, makeSTXTransferToken));

            case 1:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function openSTXTransfer(_x10) {
      return _ref8.apply(this, arguments);
    };
  }();

  var showConnect = function showConnect(authOptions) {
    if (getStacksProvider()) {
      void authenticate(authOptions);
      return;
    }

    connectUi.defineCustomElements();
    var element = document.createElement('connect-modal');
    element.authOptions = authOptions;
    document.body.appendChild(element);

    var finishedWrapper = function finishedWrapper(finishedData) {
      element.remove();
      var callback = authOptions.onFinish || authOptions.finished;

      if (callback) {
        callback(finishedData);
      }
    };

    element.addEventListener('onSignUp', function () {
      void authenticate(_extends({}, authOptions, {
        sendToSignIn: false,
        onFinish: finishedWrapper
      }));
    });
    element.addEventListener('onSignIn', function () {
      void authenticate(_extends({}, authOptions, {
        sendToSignIn: true,
        onFinish: finishedWrapper
      }));
    });

    var handleEsc = function handleEsc(ev) {
      if (ev.key === 'Escape') {
        document.removeEventListener('keydown', handleEsc);
        element.remove();
      }
    };

    element.addEventListener('onCloseModal', function () {
      document.removeEventListener('keydown', handleEsc);
      element.remove();
    });
    document.addEventListener('keydown', handleEsc);
  };
  /**
   * @deprecated Use the renamed `showConnect` method
   */

  var showBlockstackConnect = function showBlockstackConnect(authOptions) {
    return showConnect(authOptions);
  };

  Object.keys(auth).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
      enumerable: true,
      get: function () {
        return auth[k];
      }
    });
  });
  exports.authenticate = authenticate;
  exports.authenticateWithExtensionUrl = authenticateWithExtensionUrl;
  exports.defaultAuthURL = defaultAuthURL;
  exports.getOrCreateUserSession = getOrCreateUserSession;
  exports.getStacksProvider = getStacksProvider;
  exports.getUserData = getUserData;
  exports.isMobile = isMobile;
  exports.isStacksWalletInstalled = isStacksWalletInstalled;
  exports.makeContractCallToken = makeContractCallToken;
  exports.makeContractDeployToken = makeContractDeployToken;
  exports.makeSTXTransferToken = makeSTXTransferToken;
  exports.openContractCall = openContractCall;
  exports.openContractDeploy = openContractDeploy;
  exports.openSTXTransfer = openSTXTransfer;
  exports.popupCenter = popupCenter;
  exports.setupListener = setupListener;
  exports.shouldUsePopup = shouldUsePopup;
  exports.showBlockstackConnect = showBlockstackConnect;
  exports.showConnect = showConnect;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=connect.umd.development.js.map
