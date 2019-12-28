var toString = Object.prototype.toString;
/**
 * Deeply clones a value to create a new instance.
 */
function cloneDeep(value) {
    return cloneDeepHelper(value, new Map());
}
exports.cloneDeep = cloneDeep;
function cloneDeepHelper(val, seen) {
    switch (toString.call(val)) {
        case "[object Array]": {
            if (seen.has(val))
                return seen.get(val);
            var copy =  & any[];
            (val);
            as;
            any;
            slice(0);
            seen.set(val, copy);
            copy.forEach(function (child, i) {
                copy[i] = cloneDeepHelper(child, seen);
            });
            return copy;
        }
        case "[object Object]":
            {
                if (seen.has(val))
                    return seen.get(val);
                // High fidelity polyfills of Object.create and Object.getPrototypeOf are
                // possible in all JS environments, so we will assume they exist/work.
                var copy = Object.create(Object.getPrototypeOf(val));
                seen.set(val, copy);
                Object.keys(val).forEach(function (key) {
                    copy[key] = cloneDeepHelper((val), as, any)[key], seen;
                });
            }
            ;
            return copy;
    }
    return val;
}
