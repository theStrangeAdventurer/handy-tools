import { Validator } from "../src";

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
    expect(res.errors['ip']).toBeTruthy();
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
    expect(res.errors['ip']).toContain('Field is invalid');
});


