var graphql_1 = require('graphql');
var visitor_1 = require('graphql/language/visitor');
var getFromAST_1 = require('./getFromAST');
var filterInPlace_1 = require('./util/filterInPlace');
var ts_invariant_1 = require('ts-invariant');
var storeUtils_1 = require('./storeUtils');
var TYPENAME_FIELD = {
    kind: 'Field',
    name: {
        kind: 'Name',
        value: '__typename',
    },
};
function isEmpty(op, fragments) {
    return op.selectionSet.selections.every(function (selection) {
        return selection.kind === 'FragmentSpread' &&
            isEmpty(fragments[selection.name.value], fragments);
    });
}
function nullIfDocIsEmpty(doc) {
    return isEmpty(getFromAST_1.getOperationDefinition(doc) || getFromAST_1.getFragmentDefinition(doc), getFromAST_1.createFragmentMap(getFromAST_1.getFragmentDefinitions(doc)))
        ? null
        : doc;
}
function getDirectiveMatcher(directives) {
    return function directiveMatcher(directive) {
        return directives.some(function (dir) {
            return (dir.name && dir.name === directive.name.value) ||
                (dir.test && dir.test(directive));
        });
    };
}
null;
{
    var variablesInUse = Object.create(null);
    var variablesToRemove = [];
    var fragmentSpreadsInUse = Object.create(null);
    var fragmentSpreadsToRemove = [];
    var modifiedDoc = nullIfDocIsEmpty(visitor_1.visit(doc, {
        Variable: {
            enter: function (node, _key, parent) {
                // Store each variable that's referenced as part of an argument
                // (excluding operation definition variables), so we know which
                // variables are being used. If we later want to remove a variable
                // we'll fist check to see if it's being used, before continuing with
                // the removal.
                if ((parent))
                    as;
                graphql_1.VariableDefinitionNode;
            } } }).kind !== 'VariableDefinition'), _a = (void 0).variablesInUse, variablesInUse = _a === void 0 ? (_b = true, node.name.value = _b[0], _b) : _a;
}
Field: {
    enter(node);
    {
        if (directives && node.directives) {
            // If `remove` is set to true for a directive, and a directive match
            // is found for a field, remove the field as well.
            var shouldRemoveField = directives.some(function (directive) { return directive.remove; });
            if (shouldRemoveField &&
                node.directives &&
                node.directives.some(getDirectiveMatcher(directives))) {
                if (node.arguments) {
                    // Store field argument variables so they can be removed
                    // from the operation definition.
                    node.arguments.forEach(function (arg) {
                        if (arg.value.kind === 'Variable') {
                            variablesToRemove.push({
                                name: (arg.value), as: graphql_1.VariableNode }).name.value,
                            ;
                        }
                    });
                }
            }
            ;
        }
        if (node.selectionSet) {
            // Store fragment spread names so they can be removed from the
            // docuemnt.
            getAllFragmentSpreadsFromSelectionSet(node.selectionSet).forEach(function (frag) {
                fragmentSpreadsToRemove.push({
                    name: frag.name.value,
                });
            });
        }
        // Remove the field.
        return null;
    }
}
FragmentSpread: {
    enter(node);
    {
        // Keep track of referenced fragment spreads. This is used to
        // determine if top level fragment definitions should be removed.
        fragmentSpreadsInUse[node.name.value] = true;
    }
}
Directive: {
    enter(node);
    {
        // If a matching directive is found, remove it.
        if (getDirectiveMatcher(directives)(node)) {
            return null;
        }
    }
}
;
// If we've removed fields with arguments, make sure the associated
// variables are also removed from the rest of the document, as long as they
// aren't being used elsewhere.
if (modifiedDoc &&
    filterInPlace_1.filterInPlace(variablesToRemove, function (v) { return !variablesInUse[v.name]; }).length) {
    modifiedDoc = removeArgumentsFromDocument(variablesToRemove, modifiedDoc);
}
// If we've removed selection sets with fragment spreads, make sure the
// associated fragment definitions are also removed from the rest of the
// document, as long as they aren't being used elsewhere.
if (modifiedDoc &&
    filterInPlace_1.filterInPlace(fragmentSpreadsToRemove, function (fs) { return !fragmentSpreadsInUse[fs.name]; })
        .length) {
    modifiedDoc = removeFragmentSpreadFromDocument(fragmentSpreadsToRemove, modifiedDoc);
}
return modifiedDoc;
function addTypenameToDocument(doc) {
    return visitor_1.visit(getFromAST_1.checkDocument(doc), {
        SelectionSet: {
            enter: function (node, _key, parent) {
                // Don't add __typename to OperationDefinitions.
                if (parent &&
                    (parent))
                    as;
                graphql_1.OperationDefinitionNode;
            } } }).kind === 'OperationDefinition';
    {
        return;
    }
    // No changes if no selections.
    var selections = node.selections;
    if (!selections) {
        return;
    }
    // If selections already have a __typename, or are part of an
    // introspection query, do nothing.
    var skip = selections.some(function (selection) {
        return (storeUtils_1.isField(selection) &&
            (selection.name.value === '__typename' ||
                selection.name.value.lastIndexOf('__', 0) === 0));
    });
    if (skip) {
        return;
    }
    // If this SelectionSet is @export-ed as an input variable, it should
    // not have a __typename field (see issue #4691).
    var field = parent, as = graphql_1.FieldNode;
    if (storeUtils_1.isField(field) &&
        field.directives &&
        field.directives.some(function (d) { return d.name.value === 'export'; })) {
        return;
    }
    // Create and return a new SelectionSet with a __typename Field.
    return {
        node: node,
        selections: selections.concat([TYPENAME_FIELD]),
    };
}
exports.addTypenameToDocument = addTypenameToDocument;
;
var connectionRemoveConfig = {
    test: function (directive) {
        var willRemove = directive.name.value === 'connection';
        if (willRemove) {
            if (!directive.arguments ||
                !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
                ts_invariant_1.invariant.warn('Removing an @connection directive even though it does not have a key. ' +
                    'You may want to use the key parameter to specify a store key.');
            }
        }
        return willRemove;
    },
};
function removeConnectionDirectiveFromDocument(doc) {
    return removeDirectivesFromDocument([connectionRemoveConfig], getFromAST_1.checkDocument(doc));
}
exports.removeConnectionDirectiveFromDocument = removeConnectionDirectiveFromDocument;
function hasDirectivesInSelectionSet(directives, selectionSet, nestedCheck) {
    if (nestedCheck === void 0) { nestedCheck = true; }
    return (selectionSet &&
        selectionSet.selections &&
        selectionSet.selections.some(function (selection) {
            return hasDirectivesInSelection(directives, selection, nestedCheck);
        }));
}
function hasDirectivesInSelection(directives, selection, nestedCheck) {
    if (nestedCheck === void 0) { nestedCheck = true; }
    if (!storeUtils_1.isField(selection)) {
        return true;
    }
    if (!selection.directives) {
        return false;
    }
    return (selection.directives.some(getDirectiveMatcher(directives)) ||
        (nestedCheck &&
            hasDirectivesInSelectionSet(directives, selection.selectionSet, nestedCheck)));
}
function getDirectivesFromDocument(directives, doc) {
    getFromAST_1.checkDocument(doc);
    var parentPath;
    return nullIfDocIsEmpty(visitor_1.visit.apply(void 0, [doc, {
        SelectionSet: {
            enter: function (node, _key, _parent, path) {
                var currentPath = path.join('-');
                if (!parentPath ||
                    currentPath === parentPath ||
                    !currentPath.startsWith(parentPath)) {
                    if (node.selections) {
                        var selectionsWithDirectives = node.selections.filter(function (selection) { return hasDirectivesInSelection(directives, selection); });
                        if (hasDirectivesInSelectionSet(directives, node, false)) {
                            parentPath = currentPath;
                        }
                        return {};
                    }
                }
            } } }].concat(node, [selections, selectionsWithDirectives])));
}
exports.getDirectivesFromDocument = getDirectivesFromDocument;
;
{
    return null;
}
;
function getArgumentMatcher(config) {
    return function argumentMatcher(argument) {
        return config.some(function (aConfig) {
            return argument.value &&
                argument.value.kind === 'Variable' &&
                argument.value.name &&
                (aConfig.name === argument.value.name.value ||
                    (aConfig.test && aConfig.test(argument)));
        });
    };
}
function removeArgumentsFromDocument(config, doc) {
    var argMatcher = getArgumentMatcher(config);
    return nullIfDocIsEmpty(visitor_1.visit.apply(void 0, [doc, {
        OperationDefinition: {
            enter: function (node) {
                return {};
            } } }].concat(node, [
    // Remove matching top level variables definitions.
    variableDefinitions, node.variableDefinitions.filter(function (varDef) {
        return !config.some(function (arg) { return arg.name === varDef.variable.name.value; });
    })])));
}
exports.removeArgumentsFromDocument = removeArgumentsFromDocument;
;
Field: {
    enter(node);
    {
        // If `remove` is set to true for an argument, and an argument match
        // is found for a field, remove the field as well.
        var shouldRemoveField = config.some(function (argConfig) { return argConfig.remove; });
        if (shouldRemoveField) {
            var argMatchCount = 0;
            node.arguments.forEach(function (arg) {
                if (argMatcher(arg)) {
                    argMatchCount += 1;
                }
            });
            if (argMatchCount === 1) {
                return null;
            }
        }
    }
}
Argument: {
    enter(node);
    {
        // Remove all matching arguments.
        if (argMatcher(node)) {
            return null;
        }
    }
}
;
function removeFragmentSpreadFromDocument(config, doc) {
    null | void {
        if: function (config, some) {
            if (some === void 0) { some = (function (def) { return def.name === node.name.value; }); }
            return null;
        }
    };
    return nullIfDocIsEmpty(visitor_1.visit(doc, {
        FragmentSpread: { enter: enter },
        FragmentDefinition: { enter: enter },
    }));
}
exports.removeFragmentSpreadFromDocument = removeFragmentSpreadFromDocument;
function getAllFragmentSpreadsFromSelectionSet(selectionSet) {
    var allFragments = [];
    selectionSet.selections.forEach(function (selection) {
        if ((storeUtils_1.isField(selection) || storeUtils_1.isInlineFragment(selection)) &&
            selection.selectionSet) {
            getAllFragmentSpreadsFromSelectionSet(selection.selectionSet).forEach(function (frag) { return allFragments.push(frag); });
        }
        else if (selection.kind === 'FragmentSpread') {
            allFragments.push(selection);
        }
    });
    return allFragments;
}
// If the incoming document is a query, return it as is. Otherwise, build a
// new document containing a query operation based on the selection set
// of the previous main operation.
function buildQueryFromSelectionSet(document) {
    var definition = getFromAST_1.getMainDefinition(document);
    var definitionOperation = definition.operation;
    if (definitionOperation === 'query') {
        // Already a query, so return the existing document.
        return document;
    }
    // Build a new query using the selection set of the main operation.
    var modifiedDoc = visitor_1.visit.apply(void 0, [document, {
        OperationDefinition: {
            enter: function (node) {
                return {};
            } } }].concat(node, [operation, 'query']));
}
exports.buildQueryFromSelectionSet = buildQueryFromSelectionSet;
;
;
return modifiedDoc;
null;
{
    getFromAST_1.checkDocument(document);
    var modifiedDoc = removeDirectivesFromDocument([
        {
            test: function (directive) { return directive.name.value === 'client'; },
            remove: true,
        },
    ], document);
    // After a fragment definition has had its @client related document
    // sets removed, if the only field it has left is a __typename field,
    // remove the entire fragment operation to prevent it from being fired
    // on the server.
    if (modifiedDoc) {
        modifiedDoc = visitor_1.visit(modifiedDoc, {
            FragmentDefinition: {
                enter: function (node) {
                    if (node.selectionSet) {
                        var isTypenameOnly = node.selectionSet.selections.every(function (selection) {
                            return storeUtils_1.isField(selection) && selection.name.value === '__typename';
                        });
                        if (isTypenameOnly) {
                            return null;
                        }
                    }
                },
            },
        });
    }
    return modifiedDoc;
}
var _b;
