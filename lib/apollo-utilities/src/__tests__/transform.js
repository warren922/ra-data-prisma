var printer_1 = require('graphql/language/printer');
var graphql_tag_1 = require('graphql-tag');
var graphql_tag_2 = require('graphql-tag');
// Turn off warnings for repeated fragment names
graphql_tag_2.disableFragmentWarnings();
var transform_1 = require('../transform');
var getFromAST_1 = require('../getFromAST');
describe('removeArgumentsFromDocument', function () {
    it('should remove a single variable', function () {
        var query = (_a = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) {\n          child\n          foo\n        }\n        network\n      }\n    "], _a.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) {\n          child\n          foo\n        }\n        network\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field {\n          child\n          foo\n        }\n        network\n      }\n    "], _b.raw = ["\n      query Simple {\n        field {\n          child\n          foo\n        }\n        network\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeArgumentsFromDocument([{ name: 'variable' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove a single variable and the field from the query', function () {
        var query = (_a = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) {\n          child\n          foo\n        }\n        network\n      }\n    "], _a.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) {\n          child\n          foo\n        }\n        network\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        network\n      }\n    "], _b.raw = ["\n      query Simple {\n        network\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeArgumentsFromDocument([{ name: 'variable', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
});
describe('removeFragmentSpreadFromDocument', function () {
    it('should remove a named fragment spread', function () {
        var query = (_a = ["\n      query Simple {\n        ...FragmentSpread\n        property\n        ...ValidSpread\n      }\n\n      fragment FragmentSpread on Thing {\n        foo\n        bar\n        baz\n      }\n\n      fragment ValidSpread on Thing {\n        oof\n        rab\n        zab\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...FragmentSpread\n        property\n        ...ValidSpread\n      }\n\n      fragment FragmentSpread on Thing {\n        foo\n        bar\n        baz\n      }\n\n      fragment ValidSpread on Thing {\n        oof\n        rab\n        zab\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        property\n        ...ValidSpread\n      }\n\n      fragment ValidSpread on Thing {\n        oof\n        rab\n        zab\n      }\n    "], _b.raw = ["\n      query Simple {\n        property\n        ...ValidSpread\n      }\n\n      fragment ValidSpread on Thing {\n        oof\n        rab\n        zab\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeFragmentSpreadFromDocument([{ name: 'FragmentSpread', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
});
describe('removeDirectivesFromDocument', function () {
    it('should not remove unused variable definitions unless the field is removed', function () {
        var query = (_a = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField\n      }\n    "], _a.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable)\n        networkField\n      }\n    "], _b.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable)\n        networkField\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove unused variable definitions associated with the removed directive', function () {
        var query = (_a = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField\n      }\n    "], _a.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        networkField\n      }\n    "], _b.raw = ["\n      query Simple {\n        networkField\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'client', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should not remove used variable definitions', function () {
        var query = (_a = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField(usingVariable: $variable)\n      }\n    "], _a.raw = ["\n      query Simple($variable: String!) {\n        field(usingVariable: $variable) @client\n        networkField(usingVariable: $variable)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple($variable: String!) {\n        networkField(usingVariable: $variable)\n      }\n    "], _b.raw = ["\n      query Simple($variable: String!) {\n        networkField(usingVariable: $variable)\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'client', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove fragment spreads and definitions associated with the removed directive', function () {
        var query = (_a = ["\n      query Simple {\n        networkField\n        field @client {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], _a.raw = ["\n      query Simple {\n        networkField\n        field @client {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        networkField\n      }\n    "], _b.raw = ["\n      query Simple {\n        networkField\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'client', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should not remove fragment spreads and definitions used without the removed directive', function () {
        var query = (_a = ["\n      query Simple {\n        networkField {\n          ...ClientFragment\n        }\n        field @client {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], _a.raw = ["\n      query Simple {\n        networkField {\n          ...ClientFragment\n        }\n        field @client {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        networkField {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], _b.raw = ["\n      query Simple {\n        networkField {\n          ...ClientFragment\n        }\n      }\n\n      fragment ClientFragment on Thing {\n        otherField\n        bar\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'client', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove a simple directive', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field\n      }\n    "], _b.raw = ["\n      query Simple {\n        field\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove a simple directive [test function]', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field\n      }\n    "], _b.raw = ["\n      query Simple {\n        field\n      }\n    "], graphql_tag_1.default(_b));
        var test = function (_a) {
            var value = _a.name.value;
            return value === 'storage';
        };
        var doc = transform_1.removeDirectivesFromDocument([{ test: test }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove only the wanted directive', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n      }\n    "], _b.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove only the wanted directive [test function]', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n      }\n    "], _b.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n      }\n    "], graphql_tag_1.default(_b));
        var test = function (_a) {
            var value = _a.name.value;
            return value === 'storage';
        };
        var doc = transform_1.removeDirectivesFromDocument([{ test: test }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove multiple directives in the query', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n        other: field @storage\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n        other: field @storage\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field\n        other: field\n      }\n    "], _b.raw = ["\n      query Simple {\n        field\n        other: field\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove multiple directives of different kinds in the query', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        other: field @client\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        other: field @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n        other: field\n      }\n    "], _b.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field\n        other: field\n      }\n    "], graphql_tag_1.default(_b));
        var removed = [
            { name: 'storage' },
            {
                test: function (directive) { return directive.name.value === 'client'; },
            },
        ];
        var doc = transform_1.removeDirectivesFromDocument(removed, query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove a simple directive and its field if needed', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n        keep\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n        keep\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        keep\n      }\n    "], _b.raw = ["\n      query Simple {\n        keep\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove a simple directive [test function]', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n        keep\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n        keep\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        keep\n      }\n    "], _b.raw = ["\n      query Simple {\n        keep\n      }\n    "], graphql_tag_1.default(_b));
        var test = function (_a) {
            var value = _a.name.value;
            return value === 'storage';
        };
        var doc = transform_1.removeDirectivesFromDocument([{ test: test, remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should return null if the query is no longer valid', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(doc).toBe(null);
        var _a;
    });
    it('should return null if the query is no longer valid [test function]', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var test = function (_a) {
            var value = _a.name.value;
            return value === 'storage';
        };
        var doc = transform_1.removeDirectivesFromDocument([{ test: test, remove: true }], query);
        expect(doc).toBe(null);
        var _a;
    });
    it('should return null only if the query is not valid', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(query));
        var _a;
    });
    it('should return null only if the query is not valid through nested fragments', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(doc).toBe(null);
        var _a;
    });
    it('should only remove values asked through nested fragments', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n        bar\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n        bar\n      }\n    "], graphql_tag_1.default(_a));
        var expectedQuery = (_b = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        bar\n      }\n    "], _b.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        bar\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expectedQuery));
        var _a, _b;
    });
    it('should return null even through fragments if needed', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @storage\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @storage\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], query);
        expect(doc).toBe(null);
        var _a;
    });
    it('should not throw in combination with addTypenameToDocument', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        ...inDirection\n      }\n\n      fragment inDirection on Thing {\n        field @storage\n      }\n    "], graphql_tag_1.default(_a));
        expect(function () {
            transform_1.removeDirectivesFromDocument([{ name: 'storage', remove: true }], transform_1.addTypenameToDocument(query));
        }).not.toThrow();
        var _a;
    });
});
describe('query transforms', function () {
    it('should correctly add typenames', function () {
        var testQuery = (_a = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var newQueryDoc = transform_1.addTypenameToDocument(testQuery);
        var expectedQuery = (_b = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var expectedQueryStr = printer_1.print(expectedQuery);
        expect(printer_1.print(newQueryDoc)).toBe(expectedQueryStr);
        var _a, _b;
    });
    it('should not add duplicates', function () {
        var testQuery = (_a = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var newQueryDoc = transform_1.addTypenameToDocument(testQuery);
        var expectedQuery = (_b = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n            __typename\n          }\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var expectedQueryStr = printer_1.print(expectedQuery);
        expect(printer_1.print(newQueryDoc)).toBe(expectedQueryStr);
        var _a, _b;
    });
    it('should not screw up on a FragmentSpread within the query AST', function () {
        var testQuery = (_a = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n          }\n        }\n      }\n    "], _a.raw = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expectedQuery = getFromAST_1.getQueryDefinition((_b = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n            __typename\n          }\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n            __typename\n          }\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b)));
        var modifiedQuery = transform_1.addTypenameToDocument(testQuery);
        expect(printer_1.print(expectedQuery)).toBe(printer_1.print(getFromAST_1.getQueryDefinition(modifiedQuery)));
        var _a, _b;
    });
    it('should modify all definitions in a document', function () {
        var testQuery = (_a = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n          }\n        }\n      }\n\n      fragment friendFields on User {\n        firstName\n        lastName\n      }\n    "], _a.raw = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n          }\n        }\n      }\n\n      fragment friendFields on User {\n        firstName\n        lastName\n      }\n    "], graphql_tag_1.default(_a));
        var newQueryDoc = transform_1.addTypenameToDocument(testQuery);
        var expectedQuery = (_b = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n            __typename\n          }\n          __typename\n        }\n      }\n\n      fragment friendFields on User {\n        firstName\n        lastName\n        __typename\n      }\n    "], _b.raw = ["\n      query withFragments {\n        user(id: 4) {\n          friends(first: 10) {\n            ...friendFields\n            __typename\n          }\n          __typename\n        }\n      }\n\n      fragment friendFields on User {\n        firstName\n        lastName\n        __typename\n      }\n    "], graphql_tag_1.default(_b));
        expect(printer_1.print(expectedQuery)).toBe(printer_1.print(newQueryDoc));
        var _a, _b;
    });
    it('should be able to apply a QueryTransformer correctly', function () {
        var testQuery = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expectedQuery = getFromAST_1.getQueryDefinition((_b = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b)));
        var modifiedQuery = transform_1.addTypenameToDocument(testQuery);
        expect(printer_1.print(expectedQuery)).toBe(printer_1.print(getFromAST_1.getQueryDefinition(modifiedQuery)));
        var _a, _b;
    });
    it('should be able to apply a MutationTransformer correctly', function () {
        var testQuery = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n        }\n      }\n    "], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expectedQuery = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          firstName\n          lastName\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var modifiedQuery = transform_1.addTypenameToDocument(testQuery);
        expect(printer_1.print(expectedQuery)).toBe(printer_1.print(modifiedQuery));
        var _a, _b;
    });
    it('should add typename fields correctly on this one query', function () {
        var testQuery = (_a = ["\n      query Feed($type: FeedType!) {\n        # Eventually move this into a no fetch query right on the entry\n        # since we literally just need this info to determine whether to\n        # show upvote/downvote buttons\n        currentUser {\n          login\n        }\n        feed(type: $type) {\n          createdAt\n          score\n          commentCount\n          id\n          postedBy {\n            login\n            html_url\n          }\n          repository {\n            name\n            full_name\n            description\n            html_url\n            stargazers_count\n            open_issues_count\n            created_at\n            owner {\n              avatar_url\n            }\n          }\n        }\n      }\n    "], _a.raw = ["\n      query Feed($type: FeedType!) {\n        # Eventually move this into a no fetch query right on the entry\n        # since we literally just need this info to determine whether to\n        # show upvote/downvote buttons\n        currentUser {\n          login\n        }\n        feed(type: $type) {\n          createdAt\n          score\n          commentCount\n          id\n          postedBy {\n            login\n            html_url\n          }\n          repository {\n            name\n            full_name\n            description\n            html_url\n            stargazers_count\n            open_issues_count\n            created_at\n            owner {\n              avatar_url\n            }\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expectedQuery = getFromAST_1.getQueryDefinition((_b = ["\n      query Feed($type: FeedType!) {\n        currentUser {\n          login\n          __typename\n        }\n        feed(type: $type) {\n          createdAt\n          score\n          commentCount\n          id\n          postedBy {\n            login\n            html_url\n            __typename\n          }\n          repository {\n            name\n            full_name\n            description\n            html_url\n            stargazers_count\n            open_issues_count\n            created_at\n            owner {\n              avatar_url\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n      }\n    "], _b.raw = ["\n      query Feed($type: FeedType!) {\n        currentUser {\n          login\n          __typename\n        }\n        feed(type: $type) {\n          createdAt\n          score\n          commentCount\n          id\n          postedBy {\n            login\n            html_url\n            __typename\n          }\n          repository {\n            name\n            full_name\n            description\n            html_url\n            stargazers_count\n            open_issues_count\n            created_at\n            owner {\n              avatar_url\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n      }\n    "], graphql_tag_1.default(_b)));
        var modifiedQuery = transform_1.addTypenameToDocument(testQuery);
        expect(printer_1.print(expectedQuery)).toBe(printer_1.print(getFromAST_1.getQueryDefinition(modifiedQuery)));
        var _a, _b;
    });
    it('should correctly remove connections', function () {
        var testQuery = (_a = ["\n      query {\n        author {\n          name @connection(key: \"foo\") {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          name @connection(key: \"foo\") {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var newQueryDoc = transform_1.removeConnectionDirectiveFromDocument(testQuery);
        var expectedQuery = (_b = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          name {\n            firstName\n            lastName\n          }\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var expectedQueryStr = printer_1.print(expectedQuery);
        expect(expectedQueryStr).toBe(printer_1.print(newQueryDoc));
        var _a, _b;
    });
});
describe('getDirectivesFromDocument', function () {
    it('should get query with fields of storage directive ', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with fields of storage directive [test function] ', function () {
        var query = (_a = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_b));
        var test = function (_a) {
            var value = _a.name.value;
            return value === 'storage';
        };
        var doc = transform_1.getDirectivesFromDocument([{ test: test }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should only get query with fields of storage directive ', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should only get query with multiple fields of storage directive ', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        other @storage\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        other @storage\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n        other @storage\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n        other @storage\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'storage' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with fields of both storage and client directives ', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        user @client\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        user @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n        user @client\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n        user @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'storage' }, { name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with different types of directive matchers ', function () {
        var query = (_a = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        user @client\n      }\n    "], _a.raw = ["\n      query Simple {\n        maybe @skip(if: false)\n        field @storage(if: true)\n        user @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        field @storage(if: true)\n        user @client\n      }\n    "], _b.raw = ["\n      query Simple {\n        field @storage(if: true)\n        user @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([
            { name: 'storage' },
            { test: function (directive) { return directive.name.value === 'client'; } },
        ], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with nested fields ', function () {
        var query = (_a = ["\n      query Simple {\n        user {\n          firstName @client\n          email\n        }\n      }\n    "], _a.raw = ["\n      query Simple {\n        user {\n          firstName @client\n          email\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        user {\n          firstName @client\n        }\n      }\n    "], _b.raw = ["\n      query Simple {\n        user {\n          firstName @client\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should include all the nested fields of field that has client directive ', function () {
        var query = (_a = ["\n      query Simple {\n        user @client {\n          firstName\n          email\n        }\n      }\n    "], _a.raw = ["\n      query Simple {\n        user @client {\n          firstName\n          email\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        user @client {\n          firstName\n          email\n        }\n      }\n    "], _b.raw = ["\n      query Simple {\n        user @client {\n          firstName\n          email\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should return null if the query is no longer valid', function () {
        var query = (_a = ["\n      query Simple {\n        field\n      }\n    "], _a.raw = ["\n      query Simple {\n        field\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(null);
        var _a;
    });
    it('should get query with client fields in fragment', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n    "], _b.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with client fields in fragment with nested fields', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        user {\n          firstName @client\n          lastName\n        }\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        user {\n          firstName @client\n          lastName\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        user {\n          firstName @client\n        }\n      }\n    "], _b.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        user {\n          firstName @client\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get query with client fields in multiple fragments', function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n        ...anotherFragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n\n      fragment anotherFragmentSpread on AnotherThing {\n        user @client\n        product\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n        ...anotherFragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n\n      fragment anotherFragmentSpread on AnotherThing {\n        user @client\n        product\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        ...fragmentSpread\n        ...anotherFragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n\n      fragment anotherFragmentSpread on AnotherThing {\n        user @client\n      }\n    "], _b.raw = ["\n      query Simple {\n        ...fragmentSpread\n        ...anotherFragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n\n      fragment anotherFragmentSpread on AnotherThing {\n        user @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it("should return null if fragment didn't have client fields", function () {
        var query = (_a = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field\n      }\n    "], graphql_tag_1.default(_a));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(null));
        var _a;
    });
    it('should get query with client fields when both fields and fragements are mixed', function () {
        var query = (_a = ["\n      query Simple {\n        user @client\n        product @storage\n        order\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n    "], _a.raw = ["\n      query Simple {\n        user @client\n        product @storage\n        order\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n        other\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Simple {\n        user @client\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n    "], _b.raw = ["\n      query Simple {\n        user @client\n        ...fragmentSpread\n      }\n\n      fragment fragmentSpread on Thing {\n        field @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get mutation with client fields', function () {
        var query = (_a = ["\n      mutation {\n        login @client\n      }\n    "], _a.raw = ["\n      mutation {\n        login @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      mutation {\n        login @client\n      }\n    "], _b.raw = ["\n      mutation {\n        login @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should get mutation fields of client only', function () {
        var query = (_a = ["\n      mutation {\n        login @client\n        updateUser\n      }\n    "], _a.raw = ["\n      mutation {\n        login @client\n        updateUser\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      mutation {\n        login @client\n      }\n    "], _b.raw = ["\n      mutation {\n        login @client\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    describe('includeAllFragments', function () {
        it('= false: should remove the values without a client in fragment', function () {
            var query = (_a = ["\n        fragment client on ClientData {\n          hi @client\n          bye @storage\n          bar\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n          bar {\n            baz\n          }\n        }\n      "], _a.raw = ["\n        fragment client on ClientData {\n          hi @client\n          bye @storage\n          bar\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n          bar {\n            baz\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var expected = (_b = ["\n        fragment client on ClientData {\n          hi @client\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n        }\n      "], _b.raw = ["\n        fragment client on ClientData {\n          hi @client\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n        }\n      "], graphql_tag_1.default(_b));
            var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query, false);
            expect(printer_1.print(doc)).toBe(printer_1.print(expected));
            var _a, _b;
        });
        it('= true: should include the values without a client in fragment', function () {
            var query = (_a = ["\n        fragment client on ClientData {\n          hi @client\n          bye @storage\n          bar\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n          bar {\n            baz\n          }\n        }\n      "], _a.raw = ["\n        fragment client on ClientData {\n          hi @client\n          bye @storage\n          bar\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n          bar {\n            baz\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var expected = (_b = ["\n        fragment client on ClientData {\n          hi @client\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n        }\n      "], _b.raw = ["\n        fragment client on ClientData {\n          hi @client\n        }\n\n        query Mixed {\n          foo @client {\n            ...client\n          }\n        }\n      "], graphql_tag_1.default(_b));
            var doc = transform_1.getDirectivesFromDocument([{ name: 'client' }], query, true);
            expect(printer_1.print(doc)).toBe(printer_1.print(expected));
            var _a, _b;
        });
    });
});
describe('removeClientSetsFromDocument', function () {
    it('should remove @client fields from document', function () {
        var query = (_a = ["\n      query Author {\n        name\n        isLoggedIn @client\n      }\n    "], _a.raw = ["\n      query Author {\n        name\n        isLoggedIn @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      query Author {\n        name\n      }\n    "], _b.raw = ["\n      query Author {\n        name\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeClientSetsFromDocument(query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
    it('should remove @client fields from fragments', function () {
        var query = (_a = ["\n      fragment authorInfo on Author {\n        name\n        isLoggedIn @client\n      }\n    "], _a.raw = ["\n      fragment authorInfo on Author {\n        name\n        isLoggedIn @client\n      }\n    "], graphql_tag_1.default(_a));
        var expected = (_b = ["\n      fragment authorInfo on Author {\n        name\n      }\n    "], _b.raw = ["\n      fragment authorInfo on Author {\n        name\n      }\n    "], graphql_tag_1.default(_b));
        var doc = transform_1.removeClientSetsFromDocument(query);
        expect(printer_1.print(doc)).toBe(printer_1.print(expected));
        var _a, _b;
    });
});
