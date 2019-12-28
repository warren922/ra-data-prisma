var maybeDeepFreeze_1 = require('../maybeDeepFreeze');
describe('maybeDeepFreeze', function () {
    it('should deep freeze', function () {
        var foo = { bar: undefined };
        maybeDeepFreeze_1.maybeDeepFreeze(foo);
        expect(function () { return (foo.bar = 1); }).toThrow();
        expect(foo.bar).toBeUndefined();
    });
    it('should properly freeze objects without hasOwnProperty', function () {
        var foo = Object.create(null);
        foo.bar = undefined;
        maybeDeepFreeze_1.maybeDeepFreeze(foo);
        expect(function () { return (foo.bar = 1); }).toThrow();
    });
});
