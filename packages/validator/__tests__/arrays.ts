import { Validator } from "../src";

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

test('Should correctly working with array invalid object items', () => {
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
            { email: 'sometest@gmail.com', name: 'Jack' }
        ],
    });
    expect(res.errors[0]).toContain('Field email is invalid, notEmail does not match');
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
