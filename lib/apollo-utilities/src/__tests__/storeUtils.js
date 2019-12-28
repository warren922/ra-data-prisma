var storeUtils_1 = require('../storeUtils');
describe('getStoreKeyName', function () {
    it('should return a deterministic version of the store key name no matter ' +
        'which order the args object properties are in', function () {
        var validStoreKeyName = 'someField({"prop1":"value1","prop2":"value2"})';
        var generatedStoreKeyName = storeUtils_1.getStoreKeyName('someField', {
            prop1: 'value1',
            prop2: 'value2',
        });
        expect(generatedStoreKeyName).toEqual(validStoreKeyName);
        generatedStoreKeyName = storeUtils_1.getStoreKeyName('someField', {
            prop2: 'value2',
            prop1: 'value1',
        });
        expect(generatedStoreKeyName).toEqual(validStoreKeyName);
    });
});
