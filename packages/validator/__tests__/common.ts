import { Validator } from '../src';

test('Should correctly handle all values', () => {
    const scheme = new Validator({
        name: 'string',
        age: 'number',
        email: 'email',
        extra: Validator.nested({
            ip: 'ipv4',
            ipv6: 'ipv6',
        }),
        cards: Validator.arrayOf('creditCard'),
    });
    const res = scheme.validate({
        name: 'John',
        age: 20,
        email: 'author@mail.ru',
        extra: {
            ip: '192.168.0.34',
            ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
        cards: [
            '4111111111111',
            '4012888888881881',
        ]
    });
    console.log(res.errors)
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
