function tryFunctionOrLogError(f) {
    try {
        return f();
    }
    catch (e) {
        if (console.error) {
            console.error(e);
        }
    }
}
exports.tryFunctionOrLogError = tryFunctionOrLogError;
function graphQLResultHasError(result) {
    return result.errors && result.errors.length;
}
exports.graphQLResultHasError = graphQLResultHasError;
