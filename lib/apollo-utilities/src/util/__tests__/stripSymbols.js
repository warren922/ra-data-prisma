var stripSymbols_1 = require('../stripSymbols');
describe('stripSymbols', function () {
    it('should strip symbols (only)', function () {
        var sym = Symbol('id');
        var data = (_a = { foo: 'bar' }, _a[sym] = 'ROOT_QUERY', _a);
        expect(stripSymbols_1.stripSymbols(data)).toEqual({ foo: 'bar' });
        var _a;
    });
});
