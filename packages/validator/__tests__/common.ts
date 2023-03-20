import { Validator } from '../src';

test('Should correctly handle all values', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
        extra: Validator.nested({
            ip: 'ipv4',
            ipv6: 'ipv6',
        })
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'author@mail.ru',
        extra: {
            ip: '192.168.0.34',
            ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        }
    });

    expect(res.result).toBeTruthy();
});

test('Should correctly working with array items', () => {
    const scheme = new Validator({
        name: 'string',
        emails: Validator.arrayOf('email'),
    });

    const res = scheme.validate({
        name: 'John',
        emails: [
            'author@mail.ru',
            'another.mail@yandex.ru',
            'sometest@gmail.com'
        ],
    });

    expect(res.result).toBeTruthy();
});

test('Should correctly working with array invalid items', () => {
    const scheme = new Validator({
        name: 'string',
        emails: Validator.arrayOf('email'),
    });

    const res = scheme.validate({
        name: 'John',
        emails: [
            'invalidEmail',
            'another.mail@yandex.ru',
            'sometest@gmail.com'
        ],
    });

    expect(res.errors[0]).toContain('Field emails is invalid');
});

test('Should correctly working with array object items', () => {
    const scheme = new Validator({
        name: 'string',
        items: Validator.arrayOf({
            email: 'email',
            name: 'string',
        }),
    });

    const res = scheme.validate({
        name: 'John',
        items: [
            { email: 'author@mail.ru', name: 'John' },
            { email: 'another.mail@yandex.ru', name: 'Jane'},
            { email: 'sometest@gmail.com', name: 'Jack' }
        ],
    });

    expect(res.result).toBeTruthy();
});

test('Should correctly working with array object items with errors', () => {
    const scheme = new Validator({
        name: 'string',
        items: Validator.arrayOf({
            email: 'email',
            name: 'string',
        }),
    });

    const res = scheme.validate({
        name: 'John',
        items: [
            { email: 'notEmail', name: 'John' },
            { email: 'valid.email@yandex.ru', name: 'Jane'},
        ],
    });

    expect(res.errors[0]).toContain('Field email is invalid');
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

test('Should fail in nested error', () => {
    const scheme = new Validator({
        name: 'string',
        extra: Validator.nested({
            ip: 'ipv4',
        })
    });

    const res = scheme.validate({
        name: 'John',
        extra: {
            ip: 'invalid ip',
        }
    });
    expect(res.errors[0]).toContain('Field ip is invalid');
});

test('Should fail in nested twice error', () => {
    const scheme = new Validator({
        name: 'string',
        extra: Validator.nested({
            nestedTwice: Validator.nested({
                'ip': 'ipv6',
            }) 
        })
    });

    const res = scheme.validate({
        name: 'John',
        extra: {
            nestedTwice: {
                ip: 'invalid ip',
            }
        }
    });
    expect(res.errors[0]).toContain('Field ip is invalid');
});


