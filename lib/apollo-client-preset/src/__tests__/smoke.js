var _1 = require('../');
global.fetch = jest.fn(function () {
    return Promise.resolve({ json: function () { return Promise.resolve({}); } });
});
it('should have the required exports', function () {
    expect(_1.default).toBeDefined();
    expect(_1.gql).toBeDefined();
    expect(_1.HttpLink).toBeDefined();
    expect(_1.InMemoryCache).toBeDefined();
});
it('should make a client with defaults', function () {
    var client = new _1.default();
    expect(client.link).toBeDefined();
    expect(client.store.cache).toBeDefined();
});
