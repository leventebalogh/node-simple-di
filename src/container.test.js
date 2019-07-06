const { expect } = require('chai');
const containerConfig = require('./container.config.sample');
const { getContainer, STRATEGY } = require('./container');

describe('Container', () => {
    let container;

    beforeEach(() => {
        container = getContainer(containerConfig);
    });

    describe('.get()', () => {
        it('should return a simple boolean value', () => {
            const simpleValue1 = container.get('simpleValue1');
            const simpleValue2 = container.get('simpleValue2');

            expect(simpleValue1).to.eq(true);
            expect(simpleValue2).to.eq(false);
        });

        it('should return a null value', () => {
            const simpleValue3 = container.get('simpleValue3');

            expect(simpleValue3).to.eq(null);
        });

        it('should return an instance of the requested service', () => {
            const expected = 8;
            const a = container.get('a');

            expect(a).to.be.a('function');
            expect(a()).to.eq(expected);
        });

        it('should return the value by default if module is not callable', () => {
            expect(container.get('e')).to.eq(5);
        });

        it('should return the function as a value if it is specified - STRATEGY.RETURN', () => {
            const d = container.get('d');

            expect(d(2)).to.eq(4);
        });

        it('should call the function if it is specified - STRATEGY.CALL', () => {
            const f = container.get('f');

            expect(f).to.eq(25);
        });

        it('should inject the arguments as values if they are not found in the services', () => {
            const j = container.get('j');

            expect(j).to.eq(6);
        });

        it('should resolve a service as a value if it\'s definition is not an object', () => {
            const k = container.get('k');
            const q = container.get('q');

            expect(k()).to.eq(19);
            expect(container.get('o')).to.eq('Foo Bar');
            expect(q('Adam')).to.eq('Hello Adam!');
        });

        it('should call a function partially by default', () => {
            const p = container.get('p');

            expect(p(6)).to.eq(30);
        });

        it('should instantiate a class by a constructor function', () => {
            const r = container.get('r');

            expect(r.m).to.eq(8);
        });

        it('should instantiate singletons by default', () => {
            const s = container.get('s');

            expect(s.m).to.eq(8);
            s.m = 123;
            expect(container.get('s').m).to.eq(123);
        });
    });

    describe('.set()', () => {
        it('should be able to set a not defined service', () => {
            container.set('foo', {
                module: n => n * 3,
                args: ['n'],
                strategy: STRATEGY.CALL
            });

            expect(container.get('foo')).to.eq(9);
        });

        it('should be able to update an already defined service', () => {
            container.set('m', 99);

            expect(container.get('m')).to.eq(99);
        });

        it('should clear the cache for the given service', () => {
            container.get('m');
            container.set('m', 123);
            expect(container.get('m')).to.eq(123);
        });
    });
});