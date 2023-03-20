import { Validator } from '../src';

test('Should correctly handle valid emails', () => {
    const validEmails = [
        "john.doe@example.com",
        "jane_smith1234@gmail.com",
        "mike+123@example.net",
        "sarah_miller@mycompany.org",
        "samuel.lee12345@hotmail.co.uk",
    ];
    validEmails.forEach(email => {
        const scheme = new Validator({
            email: 'email',
        });

        const res = scheme.validate({
            email,
        });
        expect(res.result).toBe(true);
    });
});

test('Should correctly handle invalid emails', () => {
    const invalidEmails = [
        "john.doe@example", // missing top-level domain
        "jane_smith1234@gmail.", // missing top-level domain
        "mike+123@", // missing domain
        "sarah_miller@mycompany", // missing top-level domain
    ];

    invalidEmails.forEach(email => {
        const scheme = new Validator({
            email: 'email',
        });

        const res = scheme.validate({
            email,
        });
        expect(res.result).toBe(false);
    });
});

