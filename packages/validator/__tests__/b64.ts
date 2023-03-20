import { Validator } from '../src';

test('Should correctly handle valid base64 strings', () => {
    const b64 = [
        "dGVzdA==",
        "aGVsbG8gd29ybGQ=",
        "YW55IGNhcm5hbCBwbGVhcw==",
        "c29tZSBkYXRhIHdpdGggAC4=",
        "bm9uLXJlc3BvbnNlLWluLWJhc2U2NC1lbmNvZGVk"
    ];

    b64.forEach(_b64 => {
        const scheme = new Validator({
            b64: 'base64',
        });

        const res = scheme.validate({
            b64: _b64,
        });
        expect(res.result).toBe(true);
    });
});

test('Should correctly handle invalid base64 strings', () => {
    const b64 = [
        "abcde===",
        "notbase64"
    ];

    b64.forEach(_b64 => {
        const scheme = new Validator({
            b64: 'base64',
        });

        const res = scheme.validate({
            b64: _b64,
        });
        if (res.result) {
            console.log(_b64);
        }
        expect(res.result).toBe(false);
    });
});
