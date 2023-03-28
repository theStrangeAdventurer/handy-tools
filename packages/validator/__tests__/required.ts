import { Validator } from '../src';

test('Should correctly handle not required fiedls', () => {
    const scheme = new Validator({
        name: {
            required: false,
            validate: (value) => {
                return value === 'John'
            }
        },
        email: {
            required: false,
            type: 'email',
        }
    });
    const res = scheme.validate({
        name: '',
        email: '',
    });
    expect(res.result).toBeTruthy();
});

test('Should fail on empty required fields', () => {
    const CUSTOM_ERROR_MESSAGE = 'Name is a required field';
    const scheme = new Validator({
        name: {
            errorMessage: CUSTOM_ERROR_MESSAGE,
            required: true, // true is a default value
            validate: (value) => {
                return value === 'John'
            }
        },
    });
    const res = scheme.validate({
        name: '',
    });
    expect(res.errors[0]).toMatch(CUSTOM_ERROR_MESSAGE);
});