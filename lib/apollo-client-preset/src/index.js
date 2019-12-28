var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('apollo-client'));
__export(require('apollo-link'));
var apollo_link_http_1 = require('apollo-link-http');
__export(require('apollo-cache-inmemory'));
var apollo_cache_inmemory_2 = require('apollo-cache-inmemory');
var apollo_client_2 = require('apollo-client');
var DefaultClient = (function (_super) {
    __extends(DefaultClient, _super);
    function DefaultClient(config) {
        if (config === void 0) { config = {}; }
        if (!config.cache)
            config.cache = new apollo_cache_inmemory_2.InMemoryCache();
        if (!config.link)
            config.link = new apollo_link_http_1.HttpLink({ uri: '/graphql' });
        _super.call(this, config);
    }
    return DefaultClient;
})(apollo_client_2.default);
exports.default = DefaultClient;
