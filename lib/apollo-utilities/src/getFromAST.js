var graphql_1 = require('graphql');
var ts_invariant_1 = require('ts-invariant');
var assign_1 = require('./util/assign');
var storeUtils_1 = require('./storeUtils');
function getMutationDefinition(doc) {
    checkDocument(doc);
    var mutationDef = null = doc.definitions.filter(function (definition) {
        return definition.kind === 'OperationDefinition' &&
            definition.operation === 'mutation';
    })[0], as = graphql_1.OperationDefinitionNode;
    ts_invariant_1.invariant(mutationDef, 'Must contain a mutation definition.');
    return mutationDef;
}
exports.getMutationDefinition = getMutationDefinition;
// Checks the document for errors and throws an exception if there is an error.
function checkDocument(doc) {
    ts_invariant_1.invariant(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    var operations = doc.definitions
        .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
        .map(function (definition) {
        if (definition.kind !== 'OperationDefinition') {
            throw new ts_invariant_1.InvariantError("Schema type definitions not allowed in queries. Found: \"" + definition.kind + "\"");
        }
        return definition;
    });
    ts_invariant_1.invariant(operations.length <= 1, "Ambiguous GraphQL document: contains " + operations.length + " operations");
    return doc;
}
exports.checkDocument = checkDocument;
function getOperationDefinition(doc) {
    checkDocument(doc);
    return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
    as;
    graphql_1.OperationDefinitionNode;
}
exports.getOperationDefinition = getOperationDefinition;
function getOperationDefinitionOrDie(document) {
    var def = getOperationDefinition(document);
    ts_invariant_1.invariant(def, "GraphQL document is missing an operation");
    return def;
}
exports.getOperationDefinitionOrDie = getOperationDefinitionOrDie;
null;
{
    return (doc.definitions
        .filter(function (definition) {
        return definition.kind === 'OperationDefinition' && definition.name;
    })
        .map(function (x) { return x.name.value; })[0] || null);
}
// Returns the FragmentDefinitions from a particular document as an array
function getFragmentDefinitions(doc) {
    return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
    as;
    graphql_1.FragmentDefinitionNode[];
}
exports.getFragmentDefinitions = getFragmentDefinitions;
function getQueryDefinition(doc) {
    var queryDef = getOperationDefinition(doc), as = graphql_1.OperationDefinitionNode;
    ts_invariant_1.invariant(queryDef && queryDef.operation === 'query', 'Must contain a query definition.');
    return queryDef;
}
exports.getQueryDefinition = getQueryDefinition;
function getFragmentDefinition(doc) {
    ts_invariant_1.invariant(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    ts_invariant_1.invariant(doc.definitions.length <= 1, 'Fragment must have exactly one definition.');
    var fragmentDef = doc.definitions[0], as = graphql_1.FragmentDefinitionNode;
    ts_invariant_1.invariant(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.');
    return fragmentDef;
    as;
    graphql_1.FragmentDefinitionNode;
}
exports.getFragmentDefinition = getFragmentDefinition;
/**
 * Returns the first operation definition found in this document.
 * If no operation definition is found, the first fragment definition will be returned.
 * If no definitions are found, an error will be thrown.
 */
function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === 'OperationDefinition') {
            var operation = (definition), as = graphql_1.OperationDefinitionNode, operation;
            if (operation === 'query' ||
                operation === 'mutation' ||
                operation === 'subscription') {
                return definition;
                as;
                graphql_1.OperationDefinitionNode;
            }
        }
        if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
            // we do this because we want to allow multiple fragment definitions
            // to precede an operation definition.
            fragmentDefinition = definition;
            as;
            graphql_1.FragmentDefinitionNode;
        }
    }
    if (fragmentDefinition) {
        return fragmentDefinition;
    }
    throw new ts_invariant_1.InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
}
exports.getMainDefinition = getMainDefinition;
// Utility function that takes a list of fragment definitions and makes a hash out of them
// that maps the name of the fragment to the fragment definition.
function createFragmentMap(fragments) {
    if (fragments === void 0) { fragments = []; }
    var symTable = {};
    fragments.forEach(function (fragment) {
        symTable[fragment.name.value] = fragment;
    });
    return symTable;
}
exports.createFragmentMap = createFragmentMap;
function getDefaultValues(definition) {
    if (definition &&
        definition.variableDefinitions &&
        definition.variableDefinitions.length) {
        var defaultValues = definition.variableDefinitions
            .filter(function (_a) {
            var defaultValue = _a.defaultValue;
            return defaultValue;
        })
            .map(function (_a) {
            var variable = _a.variable, defaultValue = _a.defaultValue;
            var defaultValueObj = {};
            storeUtils_1.valueToObjectRepresentation(defaultValueObj, variable.name, defaultValue, as, graphql_1.ValueNode);
            return defaultValueObj;
        });
        return assign_1.assign.apply(void 0, [{}].concat(defaultValues));
    }
    return {};
}
exports.getDefaultValues = getDefaultValues;
/**
 * Returns the names of all variables declared by the operation.
 */
function variablesInOperation(operation) {
    var names = new Set();
    if (operation.variableDefinitions) {
        for (var _i = 0, _a = operation.variableDefinitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            names.add(definition.variable.name.value);
        }
    }
    return names;
}
exports.variablesInOperation = variablesInOperation;
