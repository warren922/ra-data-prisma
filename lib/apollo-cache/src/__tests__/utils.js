var printer_1 = require('graphql/language/printer');
var utils_1 = require('../utils');
describe('writing data with no query', function () {
    describe('converts a JavaScript object to a query correctly', function () {
        it('basic', function () {
            expect(printer_1.print(utils_1.queryFromPojo({
                number: 5,
                bool: true,
                bool2: false,
                undef: undefined,
                nullField: null,
                str: 'string',
            }))).toMatchSnapshot();
        });
        it('nested', function () {
            expect(printer_1.print(utils_1.queryFromPojo({
                number: 5,
                bool: true,
                nested: {
                    bool2: false,
                    undef: undefined,
                    nullField: null,
                    str: 'string',
                },
            }))).toMatchSnapshot();
        });
        it('arrays', function () {
            expect(printer_1.print(utils_1.queryFromPojo({
                number: [5],
                bool: [[true]],
                nested: [
                    {
                        bool2: false,
                        undef: undefined,
                        nullField: null,
                        str: 'string',
                    },
                ],
            }))).toMatchSnapshot();
        });
        it('fragments', function () {
            expect(printer_1.print(utils_1.fragmentFromPojo({
                number: [5],
                bool: [[true]],
                nested: [
                    {
                        bool2: false,
                        undef: undefined,
                        nullField: null,
                        str: 'string',
                    },
                ],
            }))).toMatchSnapshot();
        });
    });
});
