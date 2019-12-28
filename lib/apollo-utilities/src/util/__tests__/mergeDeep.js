var mergeDeep_1 = require('../mergeDeep');
describe('mergeDeep', function () {
    it('should return an object if first argument falsy', function () {
        expect(mergeDeep_1.mergeDeep()).toEqual({});
        expect(mergeDeep_1.mergeDeep(null)).toEqual({});
        expect(mergeDeep_1.mergeDeep(null, { foo: 42 })).toEqual({ foo: 42 });
    });
    it('should preserve identity for single arguments', function () {
        var arg = Object.create(null);
        expect(mergeDeep_1.mergeDeep(arg)).toBe(arg);
    });
    it('should preserve identity when merging non-conflicting objects', function () {
        var a = { a: { name: 'ay' } };
        var b = { b: { name: 'bee' } };
        var c = mergeDeep_1.mergeDeep(a, b);
        expect(c.a).toBe(a.a);
        expect(c.b).toBe(b.b);
        expect(c).toEqual({
            a: { name: 'ay' },
            b: { name: 'bee' },
        });
    });
    it('should shallow-copy conflicting fields', function () {
        var a = { conflict: { fromA: [1, 2, 3] } };
        var b = { conflict: { fromB: [4, 5] } };
        var c = mergeDeep_1.mergeDeep(a, b);
        expect(c.conflict).not.toBe(a.conflict);
        expect(c.conflict).not.toBe(b.conflict);
        expect(c.conflict.fromA).toBe(a.conflict.fromA);
        expect(c.conflict.fromB).toBe(b.conflict.fromB);
        expect(c).toEqual({
            conflict: {
                fromA: [1, 2, 3],
                fromB: [4, 5],
            },
        });
    });
    it('should resolve conflicts among more than two objects', function () {
        var sources = [];
        for (var i = 0; i < 100; ++i) {
            sources.push((_a = {},
                _a['unique' + i] = { value: i },
                _a.conflict = (_b = {},
                    _b['from' + i] = { value: i },
                    _b.nested = (_c = {},
                        _c['nested' + i] = { value: i },
                        _c
                    ),
                    _b
                ),
                _a
            ));
        }
        var merged = mergeDeep_1.mergeDeep.apply(void 0, sources);
        sources.forEach(function (source, i) {
            expect(merged['unique' + i].value).toBe(i);
            expect(source['unique' + i]).toBe(merged['unique' + i]);
            expect(merged.conflict).not.toBe(source.conflict);
            expect(merged.conflict['from' + i].value).toBe(i);
            expect(merged.conflict['from' + i]).toBe(source.conflict['from' + i]);
            expect(merged.conflict.nested).not.toBe(source.conflict.nested);
            expect(merged.conflict.nested['nested' + i].value).toBe(i);
            expect(merged.conflict.nested['nested' + i]).toBe(source.conflict.nested['nested' + i]);
        });
        var _a, _b, _c;
    });
    it('can merge array elements', function () {
        var a = [{ a: 1 }, { a: 'ay' }, 'a'];
        var b = [{ b: 2 }, { b: 'bee' }, 'b'];
        var c = [{ c: 3 }, { c: 'cee' }, 'c'];
        var d = { 1: { d: 'dee' } };
        expect(mergeDeep_1.mergeDeep(a, b, c, d)).toEqual([
            { a: 1, b: 2, c: 3 },
            { a: 'ay', b: 'bee', c: 'cee', d: 'dee' },
            'c',
        ]);
    });
    it('lets the last conflicting value win', function () {
        expect(mergeDeep_1.mergeDeep('a', 'b', 'c')).toBe('c');
        expect(mergeDeep_1.mergeDeep({ a: 'a', conflict: 1 }, { b: 'b', conflict: 2 }, { c: 'c', conflict: 3 })).toEqual({
            a: 'a',
            b: 'b',
            c: 'c',
            conflict: 3,
        });
        expect(mergeDeep_1.mergeDeep(['a', ['b', 'c'], 'd'], [ /*empty*/, ['B'], 'D'])).toEqual(['a', ['B', 'c'], 'D']);
        expect(mergeDeep_1.mergeDeep(['a', ['b', 'c'], 'd'], ['A', [ /*empty*/, 'C']])).toEqual(['A', ['b', 'C'], 'd']);
    });
    it('mergeDeep returns the intersection of its argument types', function () {
        var abc = mergeDeep_1.mergeDeep({ str: "hi", a: 1 }, { a: 3, b: 2 }, { b: 1, c: 2 });
        // The point of this test is that the following lines type-check without
        // resorting to any `any` loopholes:
        expect(abc.str.slice(0)).toBe("hi");
        expect(abc.a * 2).toBe(6);
        expect(abc.b - 0).toBe(1);
        expect(abc.c / 2).toBe(1);
    });
    it('mergeDeepArray returns the supertype of its argument types', function () {
        var F = (function () {
            function F() {
            }
            F.prototype.check = function () { return "ok"; };
            ;
            return F;
        })();
        var fs = [new F, new F, new F];
        // Although mergeDeepArray doesn't have the same tuple type awareness as
        // mergeDeep, it does infer that F should be the return type here:
        expect(mergeDeep_1.mergeDeepArray(fs).check()).toBe("ok");
    });
});
