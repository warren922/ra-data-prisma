var warnOnce_1 = require('../warnOnce');
var lastWarning = null;
var keepEnv;
var numCalls = 0;
var oldConsoleWarn;
describe('warnOnce', function () {
    beforeEach(function () {
        keepEnv = process.env.NODE_ENV;
        numCalls = 0;
        lastWarning = null;
        oldConsoleWarn = console.warn;
        console.warn = function (msg) {
            numCalls++;
            lastWarning = msg;
        };
    });
    afterEach(function () {
        process.env.NODE_ENV = keepEnv;
        console.warn = oldConsoleWarn;
    });
    it('actually warns', function () {
        process.env.NODE_ENV = 'development';
        warnOnce_1.warnOnceInDevelopment('hi');
        expect(lastWarning).toBe('hi');
        expect(numCalls).toEqual(1);
    });
    it('does not warn twice', function () {
        process.env.NODE_ENV = 'development';
        warnOnce_1.warnOnceInDevelopment('ho');
        warnOnce_1.warnOnceInDevelopment('ho');
        expect(lastWarning).toEqual('ho');
        expect(numCalls).toEqual(1);
    });
    it('warns two different things once each', function () {
        process.env.NODE_ENV = 'development';
        warnOnce_1.warnOnceInDevelopment('slow');
        expect(lastWarning).toEqual('slow');
        warnOnce_1.warnOnceInDevelopment('mo');
        expect(lastWarning).toEqual('mo');
        expect(numCalls).toEqual(2);
    });
    it('does not warn in production', function () {
        process.env.NODE_ENV = 'production';
        warnOnce_1.warnOnceInDevelopment('lo');
        warnOnce_1.warnOnceInDevelopment('lo');
        expect(numCalls).toEqual(0);
    });
    it('warns many times in test', function () {
        process.env.NODE_ENV = 'test';
        warnOnce_1.warnOnceInDevelopment('yo');
        warnOnce_1.warnOnceInDevelopment('yo');
        expect(lastWarning).toEqual('yo');
        expect(numCalls).toEqual(2);
    });
});
