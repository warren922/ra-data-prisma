var printer_1 = require('graphql/language/printer');
var graphql_tag_1 = require('graphql-tag');
var graphql_1 = require('graphql');
var getFromAST_1 = require('../getFromAST');
describe('AST utility functions', function () {
    it('should correctly check a document for correctness', function () {
        var multipleQueries = (_a = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n\n      query {\n        author {\n          address\n        }\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n\n      query {\n        author {\n          address\n        }\n      }\n    "], graphql_tag_1.default(_a));
        expect(function () {
            getFromAST_1.checkDocument(multipleQueries);
        }).toThrow();
        var namedFragment = (_b = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], graphql_tag_1.default(_b));
        expect(function () {
            getFromAST_1.checkDocument(namedFragment);
        }).not.toThrow();
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a single fragment', function () {
        var singleFragmentDefinition = (_a = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], graphql_tag_1.default(_b));
        var expectedResult = [
            expectedDoc.definitions[0], as, graphql_1.FragmentDefinitionNode,
        ];
        var actualResult = getFromAST_1.getFragmentDefinitions(singleFragmentDefinition);
        expect(actualResult.length).toEqual(expectedResult.length);
        expect(printer_1.print(actualResult[0])).toBe(printer_1.print(expectedResult[0]));
        var _a, _b;
    });
    it('should get fragment definitions from a document containing a multiple fragments', function () {
        var multipleFragmentDefinitions = (_a = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _a.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _b.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], graphql_tag_1.default(_b));
        var expectedResult = [
            expectedDoc.definitions[0], as, graphql_1.FragmentDefinitionNode,
            expectedDoc.definitions[1], as, graphql_1.FragmentDefinitionNode,
        ];
        var actualResult = getFromAST_1.getFragmentDefinitions(multipleFragmentDefinitions);
        expect(actualResult.map(printer_1.print)).toEqual(expectedResult.map(printer_1.print));
        var _a, _b;
    });
    it('should get the correct query definition out of a query containing multiple fragments', function () {
        var queryWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], _b.raw = ["\n      query {\n        author {\n          ...authorDetails\n          ...moreAuthorDetails\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var expectedResult = expectedDoc
            .definitions[0], as = graphql_1.OperationDefinitionNode;
        var actualResult = getFromAST_1.getQueryDefinition(queryWithFragments);
        expect(printer_1.print(actualResult)).toEqual(printer_1.print(expectedResult));
        var _a, _b;
    });
    it('should throw if we try to get the query definition of a document with no query', function () {
        var mutationWithFragments = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], graphql_tag_1.default(_a));
        expect(function () {
            getFromAST_1.getQueryDefinition(mutationWithFragments);
        }).toThrow();
        var _a;
    });
    it('should get the correct mutation definition out of a mutation with multiple fragments', function () {
        var mutationWithFragments = (_a = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], _a.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n    "], graphql_tag_1.default(_a));
        var expectedDoc = (_b = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], _b.raw = ["\n      mutation {\n        createAuthor(firstName: \"John\", lastName: \"Smith\") {\n          ...authorDetails\n        }\n      }\n    "], graphql_tag_1.default(_b));
        var expectedResult = expectedDoc
            .definitions[0], as = graphql_1.OperationDefinitionNode;
        var actualResult = getFromAST_1.getMutationDefinition(mutationWithFragments);
        expect(printer_1.print(actualResult)).toEqual(printer_1.print(expectedResult));
        var _a, _b;
    });
    it('should create the fragment map correctly', function () {
        var fragments = getFromAST_1.getFragmentDefinitions((_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      fragment moreAuthorDetails on Author {\n        address\n      }\n    "], graphql_tag_1.default(_a)));
        var fragmentMap = getFromAST_1.createFragmentMap(fragments);
        var expectedTable = {
            authorDetails: fragments[0],
            moreAuthorDetails: fragments[1],
        };
        expect(fragmentMap).toEqual(expectedTable);
        var _a;
    });
    it('should return an empty fragment map if passed undefined argument', function () {
        expect(getFromAST_1.createFragmentMap(undefined)).toEqual({});
    });
    it('should get the operation name out of a query', function () {
        var query = (_a = ["\n      query nameOfQuery {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      query nameOfQuery {\n        fortuneCookie\n      }\n    "], graphql_tag_1.default(_a));
        var operationName = getFromAST_1.getOperationName(query);
        expect(operationName).toEqual('nameOfQuery');
        var _a;
    });
    it('should get the operation name out of a mutation', function () {
        var query = (_a = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      mutation nameOfMutation {\n        fortuneCookie\n      }\n    "], graphql_tag_1.default(_a));
        var operationName = getFromAST_1.getOperationName(query);
        expect(operationName).toEqual('nameOfMutation');
        var _a;
    });
    it('should return null if the query does not have an operation name', function () {
        var query = (_a = ["\n      {\n        fortuneCookie\n      }\n    "], _a.raw = ["\n      {\n        fortuneCookie\n      }\n    "], graphql_tag_1.default(_a));
        var operationName = getFromAST_1.getOperationName(query);
        expect(operationName).toEqual(null);
        var _a;
    });
    it('should throw if type definitions found in document', function () {
        var queryWithTypeDefination = (_a = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }\n    "], _a.raw = ["\n      fragment authorDetails on Author {\n        firstName\n        lastName\n      }\n\n      query($search: AuthorSearchInputType) {\n        author(search: $search) {\n          ...authorDetails\n        }\n      }\n\n      input AuthorSearchInputType {\n        firstName: String\n      }\n    "], graphql_tag_1.default(_a));
        expect(function () {
            getFromAST_1.getQueryDefinition(queryWithTypeDefination);
        }).toThrowError('Schema type definitions not allowed in queries. Found: "InputObjectTypeDefinition"');
        var _a;
    });
    describe('getDefaultValues', function () {
        it('will create an empty variable object if no default values are provided', function () {
            var basicQuery = (_a = ["\n        query people($first: Int, $second: String) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], _a.raw = ["\n        query people($first: Int, $second: String) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a));
            expect(getFromAST_1.getDefaultValues(getFromAST_1.getQueryDefinition(basicQuery))).toEqual({});
            var _a;
        });
        it('will create a variable object based on the definition node with default values', function () {
            var basicQuery = (_a = ["\n        query people($first: Int = 1, $second: String!) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], _a.raw = ["\n        query people($first: Int = 1, $second: String!) {\n          allPeople(first: $first) {\n            people {\n              name\n            }\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var complexMutation = (_b = ["\n        mutation complexStuff(\n          $test: Input = { key1: [\"value\", \"value2\"], key2: { key3: 4 } }\n        ) {\n          complexStuff(test: $test) {\n            people {\n              name\n            }\n          }\n        }\n      "], _b.raw = ["\n        mutation complexStuff(\n          $test: Input = { key1: [\"value\", \"value2\"], key2: { key3: 4 } }\n        ) {\n          complexStuff(test: $test) {\n            people {\n              name\n            }\n          }\n        }\n      "], graphql_tag_1.default(_b));
            expect(getFromAST_1.getDefaultValues(getFromAST_1.getQueryDefinition(basicQuery))).toEqual({
                first: 1,
            });
            expect(getFromAST_1.getDefaultValues(getFromAST_1.getMutationDefinition(complexMutation))).toEqual({
                test: { key1: ['value', 'value2'], key2: { key3: 4 } },
            });
            var _a, _b;
        });
    });
});
