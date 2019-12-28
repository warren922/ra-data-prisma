var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var graphql_tag_1 = require('graphql-tag');
var cache_1 = require('../cache');
var TestCache = (function (_super) {
    __extends(TestCache, _super);
    function TestCache() {
        _super.apply(this, arguments);
    }
    return TestCache;
})(cache_1.ApolloCache);
describe('abstract cache', function () {
    describe('transformDocument', function () {
        it('returns the document', function () {
            var test = new TestCache();
            expect(test.transformDocument('a')).toBe('a');
        });
    });
    describe('transformForLink', function () {
        it('returns the document', function () {
            var test = new TestCache();
            expect(test.transformForLink('a')).toBe('a');
        });
    });
    describe('readQuery', function () {
        it('runs the read method', function () {
            var test = new TestCache();
            test.read = jest.fn();
            test.readQuery({});
            expect(test.read).toBeCalled();
        });
        it('defaults optimistic to false', function () {
            var test = new TestCache();
            test.read = function (_a) {
                var optimistic = _a.optimistic;
                return optimistic;
            };
            expect(test.readQuery({})).toBe(false);
            expect(test.readQuery({}, true)).toBe(true);
        });
    });
    describe('readFragment', function () {
        it('runs the read method', function () {
            var test = new TestCache();
            test.read = jest.fn();
            var fragment = {
                id: 'frag',
                fragment: (_a = ["\n          fragment a on b {\n            name\n          }\n        "], _a.raw = ["\n          fragment a on b {\n            name\n          }\n        "], graphql_tag_1.default(_a)),
            };
            test.readFragment(fragment);
            expect(test.read).toBeCalled();
            var _a;
        });
        it('defaults optimistic to false', function () {
            var test = new TestCache();
            test.read = function (_a) {
                var optimistic = _a.optimistic;
                return optimistic;
            };
            var fragment = {
                id: 'frag',
                fragment: (_a = ["\n          fragment a on b {\n            name\n          }\n        "], _a.raw = ["\n          fragment a on b {\n            name\n          }\n        "], graphql_tag_1.default(_a)),
            };
            expect(test.readFragment(fragment)).toBe(false);
            expect(test.readFragment(fragment, true)).toBe(true);
            var _a;
        });
    });
    describe('writeQuery', function () {
        it('runs the write method', function () {
            var test = new TestCache();
            test.write = jest.fn();
            test.writeQuery({});
            expect(test.write).toBeCalled();
        });
    });
    describe('writeFragment', function () {
        it('runs the write method', function () {
            var test = new TestCache();
            test.write = jest.fn();
            var fragment = {
                id: 'frag',
                fragment: (_a = ["\n          fragment a on b {\n            name\n          }\n        "], _a.raw = ["\n          fragment a on b {\n            name\n          }\n        "], graphql_tag_1.default(_a)),
            };
            test.writeFragment(fragment);
            expect(test.write).toBeCalled();
            var _a;
        });
    });
    describe('writeData', function () {
        it('either writes a fragment or a query', function () {
            var test = new TestCache();
            test.read = jest.fn();
            test.writeFragment = jest.fn();
            test.writeQuery = jest.fn();
            test.writeData({});
            expect(test.writeQuery).toBeCalled();
            test.writeData({ id: 1 });
            expect(test.read).toBeCalled();
            expect(test.writeFragment).toBeCalled();
            // Edge case for falsey id
            test.writeData({ id: 0 });
            expect(test.read).toHaveBeenCalledTimes(2);
            expect(test.writeFragment).toHaveBeenCalledTimes(2);
        });
        it('suppresses read errors', function () {
            var test = new TestCache();
            test.read = function () {
                throw new Error();
            };
            test.writeFragment = jest.fn();
            expect(function () { return test.writeData({ id: 1 }); }).not.toThrow();
            expect(test.writeFragment).toBeCalled();
        });
        it('reads __typename from typenameResult or defaults to __ClientData', function () {
            var test = new TestCache();
            test.read = function () { return ({ __typename: 'a' }); };
            var res;
            test.writeFragment = function (obj) {
                return (res = obj.fragment.definitions[0].typeCondition.name.value);
            };
            test.writeData({ id: 1 });
            expect(res).toBe('a');
            test.read = function () { return ({}); };
            test.writeData({ id: 1 });
            expect(res).toBe('__ClientData');
        });
    });
});
