var environment_1 = require('../environment');
describe('environment', function () {
    var keepEnv;
    beforeEach(function () {
        // save the NODE_ENV
        keepEnv = process.env.NODE_ENV;
    });
    afterEach(function () {
        // restore the NODE_ENV
        process.env.NODE_ENV = keepEnv;
    });
    describe('isEnv', function () {
        it("should match when there's a value", function () {
            ['production', 'development', 'test'].forEach(function (env) {
                process.env.NODE_ENV = env;
                expect(environment_1.isEnv(env)).toBe(true);
            });
        });
        it("should treat no proces.env.NODE_ENV as it'd be in development", function () {
            delete process.env.NODE_ENV;
            expect(environment_1.isEnv('development')).toBe(true);
        });
    });
    describe('isProduction', function () {
        it('should return true if in production', function () {
            process.env.NODE_ENV = 'production';
            expect(environment_1.isProduction()).toBe(true);
        });
        it('should return false if not in production', function () {
            process.env.NODE_ENV = 'test';
            expect(!environment_1.isProduction()).toBe(true);
        });
    });
    describe('isTest', function () {
        it('should return true if in test', function () {
            process.env.NODE_ENV = 'test';
            expect(environment_1.isTest()).toBe(true);
        });
        it('should return true if not in test', function () {
            process.env.NODE_ENV = 'development';
            expect(!environment_1.isTest()).toBe(true);
        });
    });
    describe('isDevelopment', function () {
        it('should return true if in development', function () {
            process.env.NODE_ENV = 'development';
            expect(environment_1.isDevelopment()).toBe(true);
        });
        it('should return true if not in development and environment is defined', function () {
            process.env.NODE_ENV = 'test';
            expect(!environment_1.isDevelopment()).toBe(true);
        });
        it('should make development as the default environment', function () {
            delete process.env.NODE_ENV;
            expect(environment_1.isDevelopment()).toBe(true);
        });
    });
});
