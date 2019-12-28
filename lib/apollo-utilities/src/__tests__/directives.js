var graphql_tag_1 = require('graphql-tag');
var lodash_1 = require('lodash');
var directives_1 = require('../directives');
var getFromAST_1 = require('../getFromAST');
describe('hasDirective', function () {
    it('should allow searching the ast for a directive', function () {
        var query = (_a = ["\n      query Simple {\n        field @live\n      }\n    "], _a.raw = ["\n      query Simple {\n        field @live\n      }\n    "], graphql_tag_1.default(_a));
        expect(directives_1.hasDirectives(['live'], query)).toBe(true);
        expect(directives_1.hasDirectives(['defer'], query)).toBe(false);
        var _a;
    });
    it('works for all operation types', function () {
        var query = (_a = ["\n      {\n        field @live {\n          subField {\n            hello @live\n          }\n        }\n      }\n    "], _a.raw = ["\n      {\n        field @live {\n          subField {\n            hello @live\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var mutation = (_b = ["\n      mutation Directive {\n        mutate {\n          field {\n            subField {\n              hello @live\n            }\n          }\n        }\n      }\n    "], _b.raw = ["\n      mutation Directive {\n        mutate {\n          field {\n            subField {\n              hello @live\n            }\n          }\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var subscription = (_c = ["\n      subscription LiveDirective {\n        sub {\n          field {\n            subField {\n              hello @live\n            }\n          }\n        }\n      }\n    "], _c.raw = ["\n      subscription LiveDirective {\n        sub {\n          field {\n            subField {\n              hello @live\n            }\n          }\n        }\n      }\n    "], graphql_tag_1.default(_c));
        [query, mutation, subscription].forEach(function (x) {
            expect(directives_1.hasDirectives(['live'], x)).toBe(true);
            expect(directives_1.hasDirectives(['defer'], x)).toBe(false);
        });
        var _a, _b, _c;
    });
    it('works for simple fragments', function () {
        var query = (_a = ["\n      query Simple {\n        ...fieldFragment\n      }\n\n      fragment fieldFragment on Field {\n        foo @live\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fieldFragment\n      }\n\n      fragment fieldFragment on Field {\n        foo @live\n      }\n    "], graphql_tag_1.default(_a));
        expect(directives_1.hasDirectives(['live'], query)).toBe(true);
        expect(directives_1.hasDirectives(['defer'], query)).toBe(false);
        var _a;
    });
    it('works for nested fragments', function () {
        var query = (_a = ["\n      query Simple {\n        ...fieldFragment1\n      }\n\n      fragment fieldFragment1 on Field {\n        bar {\n          baz {\n            ...nestedFragment\n          }\n        }\n      }\n\n      fragment nestedFragment on Field {\n        foo @live\n      }\n    "], _a.raw = ["\n      query Simple {\n        ...fieldFragment1\n      }\n\n      fragment fieldFragment1 on Field {\n        bar {\n          baz {\n            ...nestedFragment\n          }\n        }\n      }\n\n      fragment nestedFragment on Field {\n        foo @live\n      }\n    "], graphql_tag_1.default(_a));
        expect(directives_1.hasDirectives(['live'], query)).toBe(true);
        expect(directives_1.hasDirectives(['defer'], query)).toBe(false);
        var _a;
    });
});
describe('shouldInclude', function () {
    it('should should not include a skipped field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should include an included field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @include(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should not include a not include: false field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: false)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @include(if: false)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should include a skip: false field', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should not include a field if skip: true and include: true', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should not include a field if skip: true and include: false', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: false)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: true) @include(if: false)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should include a field if skip: false and include: true', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should not include a field if skip: false and include: false', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, {})).toBe(true);
        var _a;
    });
    it('should leave the original query unmodified', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(if: false) @include(if: false)\n      }\n    "], graphql_tag_1.default(_a));
        var queryClone = lodash_1.cloneDeep(query);
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        directives_1.shouldInclude(field, {});
        expect(query).toEqual(queryClone);
        var _a;
    });
    it('does not throw an error on an unsupported directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @dosomething(if: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @dosomething(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(function () {
            directives_1.shouldInclude(field, {});
        }).not.toThrow();
        var _a;
    });
    it('throws an error on an invalid argument for the skip directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @skip(nothing: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @skip(nothing: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(function () {
            directives_1.shouldInclude(field, {});
        }).toThrow();
        var _a;
    });
    it('throws an error on an invalid argument for the include directive', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(nothing: true)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @include(nothing: true)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(function () {
            directives_1.shouldInclude(field, {});
        }).toThrow();
        var _a;
    });
    it('throws an error on an invalid variable name within a directive argument', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: $neverDefined)\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @include(if: $neverDefined)\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(function () {
            directives_1.shouldInclude(field, {});
        }).toThrow();
        var _a;
    });
    it('evaluates variables on skip fields', function () {
        var query = (_a = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @skip(if: $shouldSkip)\n      }\n    "], _a.raw = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @skip(if: $shouldSkip)\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            shouldSkip: true,
        };
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, variables)).toBe(true);
        var _a;
    });
    it('evaluates variables on include fields', function () {
        var query = (_a = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @include(if: $shouldInclude)\n      }\n    "], _a.raw = ["\n      query($shouldSkip: Boolean) {\n        fortuneCookie @include(if: $shouldInclude)\n      }\n    "], graphql_tag_1.default(_a));
        var variables = {
            shouldInclude: false,
        };
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(!directives_1.shouldInclude(field, variables)).toBe(true);
        var _a;
    });
    it('throws an error if the value of the argument is not a variable or boolean', function () {
        var query = (_a = ["\n      query {\n        fortuneCookie @include(if: \"string\")\n      }\n    "], _a.raw = ["\n      query {\n        fortuneCookie @include(if: \"string\")\n      }\n    "], graphql_tag_1.default(_a));
        var field = getFromAST_1.getQueryDefinition(query).selectionSet.selections[0];
        expect(function () {
            directives_1.shouldInclude(field, {});
        }).toThrow();
        var _a;
    });
});
