var ProcBridge, ProcessBridge, __read, __spreadArray, __values, path, provideProc, requireCapabilityDependency;

provideProc = function(host) {
  /**
   * @register module proc
   * @context capability
   */
  var start, stop;
  start = function(pkg) {
    var bridge, rt, scope;
    rt = pkg.runtime || {};
    if (!rt.runtime || rt.runtime == 'node') {
      return null;
    }
    scope = host.process.getScope(pkg.folder) || host.process.createScope(pkg.folder, String(Date.now()));
    bridge = new ProcBridge(host, {
      folder: pkg.folder,
      name: rt.name || pkg.folder,
      dir: pkg.dir,
      runtime: rt.runtime,
      main: path.join(pkg.dir, rt.main || 'main.py'),
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
    host.state('proc').set(pkg.folder, bridge);
    return bridge;
  };
  stop = async function(folder) {
    var bridge;
    if (false) {
      await void 0;
    }
    bridge = host.state('proc').get(folder);
    if (bridge) {
      bridge.stop();
      host.state('proc').delete(folder);
    }
    await host.process.disposeScope(folder, 'process_module_stopped');
  };
  return {
    name: 'proc',
    phase: 'wire',
    api: {
      start: start,
      stop: stop
    },
    close: async function() {
      var __caught, _a, _b, _c, e_1, e_1_1, folder;
      e_1 = void 0;
      _a = void 0;
      if (false) {
        await void 0;
      }
      try {
        _b = __values(__spreadArray([], __read(host.state('proc').keys()), false));
        _c = _b.next();
        while (!_c.done) {
          folder = _c.value;
          await stop(folder);
          _c = _b.next();
        }
      } catch (error1) {
        e_1_1 = error1;
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (_c && !_c.done && (_a = _b.return)) {
            _a.call(_b);
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
    },
    install: function() {
      host.on('package:module', function(_a) {
        var pkg;
        pkg = _a.pkg;
        return start(pkg);
      });
    }
  };
};

requireCapabilityDependency = function(name, local) {
  var entry, error;
  entry = void 0;
  try {
    entry = require.resolve(name);
  } catch (error1) {
    error = error1;
    if (error.code != 'MODULE_NOT_FOUND') {
      throw error;
    }
    entry = require.resolve(local);
  }
  return require(entry);
};

'use strict';

__read = this && this.__read || function(o, n) {
  var __caught, ar, e, error, i, m, r;
  m = typeof Symbol == 'function' && o[Symbol.iterator];
  if (!m) {
    return o;
  }
  i = m.call(o);
  r = void 0;
  ar = [];
  e = void 0;
  try {
    while ((n == void 0 || n-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error1) {
    error = error1;
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i['return'])) {
        m.call(i);
      }
    } catch (error1) {
      __caught = error1;
      throw __caught;
    } finally {
      if (e) {
        throw e.error;
      }
    }
  }
  return ar;
};

__spreadArray = this && this.__spreadArray || function(to, from, pack) {
  var ar, i, l;
  if (pack || arguments.length == 2) {
    i = 0;
    l = from.length;
    ar = void 0;
    while (i < l) {
      if (ar || !(i in from)) {
        if (!ar) {
          ar = Array.prototype.slice.call(from, 0, i);
        }
        ar[i] = from[i];
      }
      i++;
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};

__values = this && this.__values || function(o) {
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

// Runtime-process capability.  Bridge ownership and cleanup live here rather
// than in the Logos kernel; the host provides only bus, state and scopes.
path = require('node:path');

ProcessBridge = require('@thinkiac/module-process-bridge').ProcessBridge;

ProcBridge = class ProcBridge extends ProcessBridge {
  constructor(host, opts) {
    var __caught, _a, _b, _c, e_1, e_1_1, pattern, self;
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
        return host.emit(event, payload);
      },
      onLog: function(message, kind) {
        if (kind == 'stderr') {
          return process.stderr.write('[proc:'.concat(opts.name, '] ').concat(message));
        } else {
          return host.log('[proc] "'.concat(opts.name, '" ').concat(message));
        }
      },
      onError: function(error) {
        return host.log('[proc] '.concat(opts.name, ': ').concat(error.message));
      },
      onExit: function(_a) {
        var code, signal, supervisor;
        code = _a.code;
        signal = _a.signal;
        host.emit('proc:crashed', {
          module: opts.name,
          code: code
        });
        supervisor = host.process.supervisor();
        if (!supervisor) {
          return false;
        }
        supervisor.scheduleProc(opts.folder || opts.name, (async function() {
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
    self = this;
    this.host = host;
    this.folder = opts.folder || opts.name;
    this.scope = opts.scope;
    this.unsubscribes = [];
    try {
      _b = __values(opts.events || [''.concat(opts.name, ':*')]);
      _c = _b.next();
      while (!_c.done) {
        pattern = _c.value;
        this.subscribe(pattern);
        _c = _b.next();
      }
    } catch (error1) {
      e_1_1 = error1;
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) {
          _a.call(_b);
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
    unsubscribe = this.host.on(pattern, (function(payload) {
      return _this.call(pattern, payload);
    }), {
      owner: 'proc:'.concat(this.name),
      priority: 100,
      scope: this.scope
    });
    this.unsubscribes.push(unsubscribe);
  }

  stop() {
    var __caught, _a, _b, _c, _d, e_1, e_1_1, unsubscribe;
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
    ((_b = this.host.process.supervisor()) == null || _b == void 0 ? void 0 : _b.cancel(this.folder));
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

module.exports = {
  provideProc: provideProc
};

// Compatibility factories resolve their SDK from their own dependency graph.
module.exports.createHost = function() {
  var _a, _i, args;
  _a = void 0;
  args = [];
  _i = 0;
  while (_i < arguments.length) {
    args[_i] = arguments[_i];
    _i++;
  }
  return (_a = requireCapabilityDependency('@thinkiac/module-runtime-compat', '../runtime-compat')).createHost.apply(_a, __spreadArray([], __read(args), false));
};

// Library alias for existing direct consumers; not used for runtime discovery.
module.exports.createRuntimeModule = provideProc;
