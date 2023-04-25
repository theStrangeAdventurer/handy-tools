import { Validator } from '../src';

test('Should correctly validate incompatible object', () => {
    const scheme = new Validator({
        name: 'string',
        title: 'string',
        type: 'string',
    });

    const res = scheme.validate({
        name: 'John',
    });

    expect([
        "Object is incompatible with scheme: hasn't this 'title' field",
        "Object is incompatible with scheme: hasn't this 'type' field"
      ].sort()).toEqual(res.errors.sort());
});

test('Should correctly handle all values', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        emails: Validator.nested({
            gmailEmail: {
                type: 'email',
                required: true, // true is default value
                // Custom validation function
                errorMessage: 'Gmail email is required',
                // Custom validation function
                validate: (value) => {
                    return value?.includes('@gmail.com');
                }
            },
            optionalEmail: {
                type: 'email',
                required: false,
            },
        }),
        extra: Validator.nested({
            ip: 'ipv4',
            ipv6: 'ipv6',
        })
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        emails: {
            gmailEmail: 'some@gmail.com',
            optionalEmail: '',
        },
        extra: {
            ip: '192.168.0.34',
            ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        }
    });
    expect(res.result).toBeTruthy();
});

test('Should fail with validate extra fields', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
    }, {
        validateExtraFields: true,
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'email@gmail.com',
        extra: 'this field nit exists in scheme',
    });
    expect(res.errors[0]).toContain('Validator hasn\'t this field in scheme');
});

test('Should pass with object with extra fields', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
    }, {
        validateExtraFields: false,
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'email@gmail.com',
        extra: 'this field nit exists in scheme and now is valid',
    });
    expect(res.result).toBeTruthy();
});

test('Should fail with validate extra nested fields', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
    }, {
        validateExtraFields: true,
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'email@gmail.com',
        extra: { // Not validatabale fields
            email: 'someemail@gmail.com',
            name: 'John',
        }
    });
    expect(res.errors[0]).toContain("Validator hasn't this field in scheme");
});

test('Should pass object with extra nested fiedls', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
    }, {
        validateExtraFields: false,
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'email@gmail.com',
        extra: { // Not validatabale fields
            email: 'someemail@gmail.com',
            name: 'John',
        }
    });
    expect(res.result).toBeTruthy();
});

test('Should fail in flat error', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
    });

    const res = scheme.validate({
        name: 'John',
        age: '20',
        email: 'author@mail.ru',
    });
    expect(res.errors[0]).toBe('Field age is not a number');
});
