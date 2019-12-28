var cloneDeep_1 = require('../cloneDeep');
describe('cloneDeep', function () {
    it('will clone primitive values', function () {
        expect(cloneDeep_1.cloneDeep(undefined)).toEqual(undefined);
        expect(cloneDeep_1.cloneDeep(null)).toEqual(null);
        expect(cloneDeep_1.cloneDeep(true)).toEqual(true);
        expect(cloneDeep_1.cloneDeep(false)).toEqual(false);
        expect(cloneDeep_1.cloneDeep(-1)).toEqual(-1);
        expect(cloneDeep_1.cloneDeep(+1)).toEqual(+1);
        expect(cloneDeep_1.cloneDeep(0.5)).toEqual(0.5);
        expect(cloneDeep_1.cloneDeep('hello')).toEqual('hello');
        expect(cloneDeep_1.cloneDeep('world')).toEqual('world');
    });
    it('will clone objects', function () {
        var value1 = {};
        var value2 = { a: 1, b: 2, c: 3 };
        var value3 = { x: { a: 1, b: 2, c: 3 }, y: { a: 1, b: 2, c: 3 } };
        var clonedValue1 = cloneDeep_1.cloneDeep(value1);
        var clonedValue2 = cloneDeep_1.cloneDeep(value2);
        var clonedValue3 = cloneDeep_1.cloneDeep(value3);
        expect(clonedValue1).toEqual(value1);
        expect(clonedValue2).toEqual(value2);
        expect(clonedValue3).toEqual(value3);
        expect(clonedValue1).toEqual(value1);
        expect(clonedValue2).toEqual(value2);
        expect(clonedValue3).toEqual(value3);
        expect(clonedValue3.x).toEqual(value3.x);
        expect(clonedValue3.y).toEqual(value3.y);
    });
    it('will clone arrays', function () {
        var value1 = [];
        var value2 = [1, 2, 3];
        var value3 = [[1, 2, 3], [1, 2, 3]];
        var clonedValue1 = cloneDeep_1.cloneDeep(value1);
        var clonedValue2 = cloneDeep_1.cloneDeep(value2);
        var clonedValue3 = cloneDeep_1.cloneDeep(value3);
        expect(clonedValue1).toEqual(value1);
        expect(clonedValue2).toEqual(value2);
        expect(clonedValue3).toEqual(value3);
        expect(clonedValue1).toEqual(value1);
        expect(clonedValue2).toEqual(value2);
        expect(clonedValue3).toEqual(value3);
        expect(clonedValue3[0]).toEqual(value3[0]);
        expect(clonedValue3[1]).toEqual(value3[1]);
    });
    it('should not attempt to follow circular references', function () {
        var someObject = {
            prop1: 'value1',
            anotherObject: null,
        };
        var anotherObject = {
            someObject: someObject,
        };
        someObject.anotherObject = anotherObject;
        var chk;
        expect(function () {
            chk = cloneDeep_1.cloneDeep(someObject);
        }).not.toThrow();
    });
});
