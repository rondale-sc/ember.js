import isNone from 'ember-metal/is_none';
import run from 'ember-metal/run_loop';

var originalSetTimeout = window.setTimeout;
var originalDateValueOf = Date.prototype.valueOf;

function wait(callback, maxWaitCount) {
  maxWaitCount = isNone(maxWaitCount) ? 100 : maxWaitCount;

  originalSetTimeout(function() {
    if (maxWaitCount > 0 && (run.hasScheduledTimers() || run.currentRunLoop)) {
      wait(callback, maxWaitCount - 1);

      return;
    }

    callback();
  }, 10);
}

QUnit.module('system/run_loop/scheduling_async', {
  teardown() {
    window.setTimeout = originalSetTimeout;
    Date.prototype.valueOf = originalDateValueOf;
  }
});

QUnit.asyncTest('test something', function(assert) {
  var array = [];

  run(function() {
    run.later(function() {
      array.push('later');
    }, 50);
    run.next(function() {
      array.push('next');
    });
  });

  wait(function() {
    QUnit.start();
    assert.deepEqual(array, ['next', 'later']);
  });
});
