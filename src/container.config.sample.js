const { STRATEGY } = require('./container');

// This is a sample configuration used for the tests.
module.exports = {
    simpleValue1: true,
    simpleValue2: false,
    simpleValue3: null,
    a: {
        module: (b, e) => {
            return b() + e + 2;
        },
        args: ['b', 'e']
    },
    b: {
        module: c => c.foo,
        args: ['c']
    },
    c: {
        module: {
            foo: 1,
            bar: 2
        }
    },
    d: {
        module: a => a * 2,
        strategy: STRATEGY.RETURN
    },
    e: {
        module: 5
    },
    f: {
        module: (e, i) => e * 3 + i,
        strategy: STRATEGY.CALL,
        args: ['e', 'i']
    },
    i: {
        module: 10
    },
    j: {
        module: a => a * 2,
        strategy: STRATEGY.CALL,
        args: [3]
    },
    k: {
        module: (m, n) => m * 2 + n,
        args: ['m', 'n']
    },
    m: 8,
    n: 3,
    o: 'Foo Bar',
    p: {
        module: (m, x) => m * 3 + x,
        args: ['m']
    },
    q: name => `Hello ${ name }!`,
    r: {
        module: function (m) {
            this.m = m;
        },
        args: ['m'],
        strategy: STRATEGY.NEW
    },
    s: {
        module: function (m) {
            this.m = m;
        },
        args: ['m'],
        strategy: STRATEGY.NEW
    }
};