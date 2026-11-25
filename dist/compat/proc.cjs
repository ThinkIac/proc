// Legacy public compatibility implementation, owned by module-proc.
module.exports = function(require, module, exports, __dirname, __filename, kernel) {
  var ProcBridge, ProcessBridge, __importDefault, path_1, startProcessModule, stopProcessModule;
  // Process-module integration for the external JSONL bridge.
  /** Spawns bridges for every workspace module declared with a non-node runtime. */
  startProcessModule = function(container, pkg) {
    var _a, bridge, rt, runtime, scope;
    _a = void 0;
    rt = pkg.runtime || {};
    runtime = rt.runtime;
    if (!runtime || runtime == 'node') {
      return null;
    }
    scope = ((_a = container.getPackageScope(pkg.folder)) != null && _a != void 0 ? _a : container.createPackageScope(pkg.folder, String(Date.now())));
    bridge = new ProcBridge(container, {
      folder: pkg.folder,
      name: rt.name || pkg.folder,
      dir: pkg.dir,
      runtime: runtime,
      main: path_1.default.join(pkg.dir, rt.main || 'main.py'),
      events: rt.events || [''.concat(rt.name || pkg.folder, ':*')],
      scope: scope
    });
    bridge.start();
    scope.defer((function() {
      return bridge.stop();
    }), {
      kind: 'process',
      label: rt.name || pkg.folder
    });
    container.state('proc').set(pkg.folder, bridge);
    return bridge;
  };
  stopProcessModule = async function(container, folder) {
    var bridge;
    if (false) {
      await void 0;
    }
    bridge = container.state('proc').get(folder);
    if (bridge) {
      bridge.stop();
      container.state('proc').delete(folder);
    }
    await container.disposePackageScope(folder, 'process_module_stopped');
  };
  'use strict';
  __importDefault = this && this.__importDefault || function(mod) {
    if (mod && mod.__esModule) {
      return mod;
    } else {
      return {
        'default': mod
      };
    }
  };
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.startProcessModule = startProcessModule;
  exports.stopProcessModule = stopProcessModule;
  path_1 = __importDefault(require('path'));
  ProcessBridge = require('@thinkiac/module-process-bridge').ProcessBridge;
  /** Connects the host bus and lifecycle to the reusable transport. */
  ProcBridge = class ProcBridge extends ProcessBridge {
    constructor(container, opts) {
      var __caught, __values, _a, _b, _c, _d, e_1, e_1_1, pattern, self;
      __values = function(o) {
        var i, m, s;
        s = typeof Symbol == 'function' && Symbol.iterator;
        m = s && o[s];
        i = 0;
        if (m) {
          return m.call(o);
        }
        if (o && typeof o.length == 'number') {
          return {
            next: function() {
              if (o && i >= o.length) {
                o = void 0;
              }
              return {
                value: o && o[i++],
                done: !o
              };
            }
          };
        }
        throw new TypeError((s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'));
      };
      e_1 = void 0;
      _a = void 0;
      _b = void 0;
      self = void 0;
      super({
        name: opts.name,
        cwd: opts.dir,
        runtime: opts.runtime,
        main: opts.main,
        onRegister: function(patterns) {
          return patterns.forEach(function(pattern) {
            return self.subscribe(pattern);
          });
        },
        onEmit: function(event, payload) {
          return container.bus.emit(event, payload);
        },
        onLog: function(message, kind) {
          if (kind == 'stderr') {
            return process.stderr.write('[proc:'.concat(opts.name, '] ').concat(message));
          } else {
            return container.log('[proc] "'.concat(opts.name, '" ').concat(message));
          }
        },
        onError: function(error) {
          return container.log('[proc] '.concat(opts.name, ': ').concat(error.message));
        },
        onExit: function(_a) {
          var _b;
          var code, signal, supervisor;
          _b = void 0;
          code = _a.code;
          signal = _a.signal;
          container.bus.emit('proc:crashed', {
            module: opts.name,
            code: code
          });
          supervisor = container.state('supervisor').get('controller');
          if (!supervisor) {
            return false;
          }
          supervisor.scheduleProc(((_b = opts.folder) != null && _b != void 0 ? _b : opts.name), (async function() {
            if (false) {
              await void 0;
            }
            if (self.stopped) {
              return {
                ok: false,
                error: 'Bridge stopped'
              };
            }
            self.start();
            return {
              health: 'unknown'
            };
          }), {
            code: code,
            signal: signal
          });
          return true;
        }
      });
      this.unsubscribes = [];
      self = this;
      this.container = container;
      this.folder = ((_b = opts.folder) != null && _b != void 0 ? _b : opts.name);
      this.scope = opts.scope;
      try {
        _c = __values(opts.events || [''.concat(opts.name, ':*')]);
        _d = _c.next();
        while (!_d.done) {
          pattern = _d.value;
          this.subscribe(pattern);
          _d = _c.next();
        }
      } catch (error1) {
        e_1_1 = error1;
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_d && !_d.done && (_a = _c.return)) {
            _a.call(_c);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_1) {
            throw e_1.error;
          }
        }
      }
      return;
    }

    subscribe(pattern) {
      var _this, unsubscribe;
      _this = this;
      unsubscribe = this.container.bus.on(pattern, (function(payload) {
        return _this.call(pattern, payload);
      }), {
        owner: 'proc:'.concat(this.name),
        priority: 100,
        scope: this.scope
      });
      this.unsubscribes.push(unsubscribe);
    }

    stop() {
      var __caught, __values, _a, _b, _c, _d, e_1, e_1_1, unsubscribe;
      __values = function(o) {
        var i, m, s;
        s = typeof Symbol == 'function' && Symbol.iterator;
        m = s && o[s];
        i = 0;
        if (m) {
          return m.call(o);
        }
        if (o && typeof o.length == 'number') {
          return {
            next: function() {
              if (o && i >= o.length) {
                o = void 0;
              }
              return {
                value: o && o[i++],
                done: !o
              };
            }
          };
        }
        throw new TypeError((s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.'));
      };
      e_1 = void 0;
      _a = void 0;
      _b = void 0;
      ((_b = this.container.state('supervisor').get('controller')) == null || _b == void 0 ? void 0 : _b.cancel(this.folder));
      try {
        _c = __values(this.unsubscribes);
        _d = _c.next();
        while (!_d.done) {
          unsubscribe = _d.value;
          unsubscribe();
          _d = _c.next();
        }
      } catch (error1) {
        e_1_1 = error1;
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_d && !_d.done && (_a = _c.return)) {
            _a.call(_c);
          }
        } catch (error1) {
          __caught = error1;
          throw __caught;
        } finally {
          if (e_1) {
            throw e_1.error;
          }
        }
      }
      super.stop();
    }

  };
};
