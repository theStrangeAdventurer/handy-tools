import { Validator } from '../src';

test('Should correctly handle custom validation fn result', () => {
    const scheme = new Validator({
        name: {
            validate: (value) => {
                return value === 'John'
            }
        },
        age: 'number',
        email: 'email',
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'author@mail.ru',
    });
    expect(res.result).toBeTruthy();
});

test('Should correctly handle invalid validation fn result', () => {
    const scheme = new Validator({
        name: {
            errorMessage: 'Name must be only John',
            validate: (value) => {
                return value === 'John'
            }
        },
        age: 'number',
        email: 'email',
    });
    const res = scheme.validate({
        name: 'Not John',
        age: 20,
        email: 'author@mail.ru',
    });
    expect(res.errors[0]).toContain('Name must be only John');
});

test('Should correctly handle nested validation fn result', () => {
    const scheme = new Validator({
        person: Validator.nested({
            name: 'string',
            email: {
                errorMessage: 'email must include @',
                validate(value) {
                    return value.includes('@');
                }
            }
        }),
    });
    const res = scheme.validate({
        person: {
            name: 'John',
            email: 'e@mailWith@.ru',
        }
    });
    expect(res.result).toBeTruthy();
});

test('Should fail handle nested validation fn result', () => {
    const CUSTOM_ERROR_MESSAGE =  'email must include @'
    const scheme = new Validator({
        person: Validator.nested({
            name: 'string',
            email: {
                errorMessage: CUSTOM_ERROR_MESSAGE ,
                validate(value) {
                    return value.includes('@');
                }
            }
        }),
    });
    const res = scheme.validate({
        person: {
            name: 'John',
            email: 'invalidEmail',
        }
    });
    expect(res.errors[0]).toContain(CUSTOM_ERROR_MESSAGE);
});

test('Should show custom error message without validate function', () => {
    const CUSTOM_ERROR_MESSAGE =  'Email is a required field'
    const scheme = new Validator({
        person: Validator.nested({
            name: 'string',
            email: {
                errorMessage: CUSTOM_ERROR_MESSAGE,
                type: 'email'
            }
        }),
    });
    const res = scheme.validate({
        person: {
            name: 'John',
            email: 'invalidEmail',
        }
    });
    expect(res.errors[0]).toContain(CUSTOM_ERROR_MESSAGE);
});