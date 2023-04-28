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
    const scheme = new Validator({
        name: {
            validate: (value) => value
        },
    });
    const res = scheme.validate({
        name: '',
    });
    expect(res.errors['name']).toBeTruthy();
});