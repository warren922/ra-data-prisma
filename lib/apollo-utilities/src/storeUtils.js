var graphql_1 = require('graphql');
var fast_json_stable_stringify_1 = require('fast-json-stable-stringify');
var ts_invariant_1 = require('ts-invariant');
null | IdValue > ;
null
    | undefined
    | void 
    | Object;
function isScalarValue(value) {
    return ['StringValue', 'BooleanValue', 'EnumValue'].indexOf(value.kind) > -1;
}
exports.isScalarValue = isScalarValue;
function isNumberValue(value) {
    return ['IntValue', 'FloatValue'].indexOf(value.kind) > -1;
}
exports.isNumberValue = isNumberValue;
function isStringValue(value) {
    return value.kind === 'StringValue';
}
function isBooleanValue(value) {
    return value.kind === 'BooleanValue';
}
function isIntValue(value) {
    return value.kind === 'IntValue';
}
function isFloatValue(value) {
    return value.kind === 'FloatValue';
}
function isVariable(value) {
    return value.kind === 'Variable';
}
function isObjectValue(value) {
    return value.kind === 'ObjectValue';
}
function isListValue(value) {
    return value.kind === 'ListValue';
}
function isEnumValue(value) {
    return value.kind === 'EnumValue';
}
function isNullValue(value) {
    return value.kind === 'NullValue';
}
function valueToObjectRepresentation(argObj, name, value, variables) {
    if (isIntValue(value) || isFloatValue(value)) {
        argObj[name.value] = Number(value.value);
    }
    else if (isBooleanValue(value) || isStringValue(value)) {
        argObj[name.value] = value.value;
    }
    else if (isObjectValue(value)) {
        var nestedArgObj = {};
        value.fields.map(function (obj) {
            return valueToObjectRepresentation(nestedArgObj, obj.name, obj.value, variables);
        });
        argObj[name.value] = nestedArgObj;
    }
    else if (isVariable(value)) {
        var variableValue = (variables || ({})), as = any, _a = void 0, value_1 = _a[0], name_1 = _a[1], value_2 = _a[2];
        argObj[name_1.value] = variableValue;
    }
    else if (isListValue(value)) {
        argObj[name.value] = value.values.map(function (listValue) {
            var nestedArgArrayObj = {};
            valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
            return (nestedArgArrayObj);
            as;
            any;
        })[name.value];
    }
    ;
}
exports.valueToObjectRepresentation = valueToObjectRepresentation;
if (isEnumValue(value)) {
    argObj[name.value] = (value);
    as;
    graphql_1.EnumValueNode;
    value;
}
else if (isNullValue(value)) {
    argObj[name.value] = null;
}
else {
    throw new ts_invariant_1.InvariantError("The inline argument \"" + name.value + "\" of kind \"" + (value), as, any).kind;
}
"` +;
'is not supported. Use variables instead of inline arguments to ' +
    'overcome this limitation.',
;
;
function storeKeyNameFromField(field, variables) {
    var directivesObj = null;
    if (field.directives) {
        directivesObj = {};
        field.directives.forEach(function (directive) {
            directivesObj[directive.name.value] = {};
            if (directive.arguments) {
                directive.arguments.forEach(function (_a) {
                    var name = _a.name, value = _a.value;
                    return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
                });
            }
        });
    }
    var argObj = null;
    if (field.arguments && field.arguments.length) {
        argObj = {};
        field.arguments.forEach(function (_a) {
            var name = _a.name, value = _a.value;
            return valueToObjectRepresentation(argObj, name, value, variables);
        });
    }
    return getStoreKeyName(field.name.value, argObj, directivesObj);
}
exports.storeKeyNameFromField = storeKeyNameFromField;
var KNOWN_DIRECTIVES = [
    'connection',
    'include',
    'skip',
    'client',
    'rest',
    'export',
];
function getStoreKeyName(fieldName, args, directives) {
    if (directives &&
        directives['connection'] &&
        directives['connection']['key']) {
        if (directives['connection']['filter'] &&
            (directives['connection']['filter']))
            as;
        string[];
        length > 0;
        {
            var filterKeys = directives['connection']['filter']
                ? (directives['connection']['filter']) : as, string = [];
            [];
            filterKeys.sort();
            var queryArgs = args, as = (_a = {}, _a[key] = string, _a.any = any, _a);
            var filteredArgs = {}, as = (_b = {}, _b[key] = string, _b.any = any, _b);
            filterKeys.forEach(function (key) {
                filteredArgs[key] = queryArgs[key];
            });
            return directives['connection']['key'] + "(" + JSON.stringify(filteredArgs) + ")";
        }
        {
            return directives['connection']['key'];
        }
    }
    var completeFieldName = fieldName;
    if (args) {
        // We can't use `JSON.stringify` here since it's non-deterministic,
        // and can lead to different store key names being created even though
        // the `args` object used during creation has the same properties/values.
        var stringifiedArgs = fast_json_stable_stringify_1.default(args);
        completeFieldName += "(" + stringifiedArgs + ")";
    }
    if (directives) {
        Object.keys(directives).forEach(function (key) {
            if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
                return;
            if (directives[key] && Object.keys(directives[key]).length) {
                completeFieldName += "@" + key + "(" + JSON.stringify(directives[key]) + ")";
            }
            else {
                completeFieldName += "@" + key;
            }
        });
    }
    return completeFieldName;
    var _a, _b;
}
exports.getStoreKeyName = getStoreKeyName;
function argumentsObjectFromField(field, variables) {
    if (field.arguments && field.arguments.length) {
        var argObj = {};
        field.arguments.forEach(function (_a) {
            var name = _a.name, value = _a.value;
            return valueToObjectRepresentation(argObj, name, value, variables);
        });
        return argObj;
    }
    return null;
}
exports.argumentsObjectFromField = argumentsObjectFromField;
function resultKeyNameFromField(field) {
    return field.alias ? field.alias.value : field.name.value;
}
exports.resultKeyNameFromField = resultKeyNameFromField;
function isField(selection) {
    return selection.kind === 'Field';
}
exports.isField = isField;
function isInlineFragment(selection) {
    return selection.kind === 'InlineFragment';
}
exports.isInlineFragment = isInlineFragment;
function isIdValue(idObject) {
    return idObject &&
        (idObject);
    as;
    IdValue | JsonValue;
    type === 'id' &&
        typeof (idObject);
    as;
    IdValue;
    generated === 'boolean';
}
exports.isIdValue = isIdValue;
function toIdValue(idConfig, generated) {
    if (generated === void 0) { generated = false; }
    return {
        type: 'id',
        generated: generated,
    }(typeof idConfig === 'string'
        ? { id: idConfig, typename: undefined }
        : idConfig),
    ;
}
exports.toIdValue = toIdValue;
;
function isJsonValue(jsonObject) {
    return (jsonObject != null &&
        typeof jsonObject === 'object' &&
        (jsonObject));
    as;
    IdValue | JsonValue;
    type === 'json';
    ;
}
exports.isJsonValue = isJsonValue;
function defaultValueFromVariable(node) {
    throw new ts_invariant_1.InvariantError("Variable nodes are not supported by valueFromNode");
}
/**
 * Evaluate a ValueNode and yield its value in its natural JS form.
 */
function valueFromNode(node, onVariable) {
    if (onVariable === void 0) { onVariable = defaultValueFromVariable; }
    switch (node.kind) {
        case 'Variable':
            return onVariable(node);
        case 'NullValue':
            return null;
        case 'IntValue':
            return parseInt(node.value, 10);
        case 'FloatValue':
            return parseFloat(node.value);
        case 'ListValue':
            return node.values.map(function (v) { return valueFromNode(v, onVariable); });
        case 'ObjectValue': {
            var value = {};
            for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
                var field = _a[_i];
                value[field.name.value] = valueFromNode(field.value, onVariable);
            }
            return value;
        }
        default:
            return node.value;
    }
}
exports.valueFromNode = valueFromNode;
