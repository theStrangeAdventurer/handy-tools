import { Validator } from "../src";

test('Should correctly working with OR conditions', () => {
    const scheme = new Validator({
        name: 'string',
        emailOrPerson: Validator.or([
            {
                email: 'email',
                name: 'string',
            },
            'email'
        ]),
    });

    const res1 = scheme.validate({
        name: 'John',
        emailOrPerson: 'valid.email@yandex.ru'
    });
    const res2 = scheme.validate({
        name: 'John',
        emailOrPerson: {
            email: 'valid.email@yandex.ru',
            name: 'Jane',
        }
    });
    expect(res1.result && res2.result).toBeTruthy();
});

test('Should correctly working with invalid OR conditions', () => {
    const scheme = new Validator({
        name: 'string',
        items: Validator.or([
            {
                email: 'email',
                name: 'string',
            }
        ]),
    });

    const res = scheme.validate({
        name: 'John',
        items: { email: 'notEmail', name: 'John' },
    });
    expect(res.errors['email']).toContain('Field is invalid, notEmail does not match');
});