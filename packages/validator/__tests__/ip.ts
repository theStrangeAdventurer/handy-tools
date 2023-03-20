import { Validator } from '../src';

test('Should correctly handle valid ipv4', () => {
    const ip = [
        "192.0.2.1",
        "172.16.254.1",
        "10.0.0.1",
        "255.255.255.255",
        "127.0.0.1",
    ];
    ip.forEach(_ip => {
        const scheme = new Validator({
            ip: 'ipv4',
        });

        const res = scheme.validate({
            ip: _ip,
        });
        expect(res.result).toBe(true);
    });
});

test('Should correctly handle invalid ipv4', () => {
    const ip = [
        "256.256.256.256",
        "192.168.0.256",
        "fe80::1"
    ];
    ip.forEach(_ip => {
        const scheme = new Validator({
            ip: 'ipv4',
        });

        const res = scheme.validate({
            ip: _ip,
        });
        if (res.result) {
            console.log(_ip);
        }
        expect(res.result).toBe(false);
    });
});

