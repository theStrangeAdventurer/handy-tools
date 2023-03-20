import { Validator } from '../src';

test('Should correctly handle valid URLs', () => {
    const urls = [
        'http://google.com',
        'https://google.com',
        'http://google.com/',
        'https://google.com/',
        'http://google.com:80',
        'https://google.com:80/',
        'http://google.com:80/path',
        'https://google.com:80/path',
        'http://google.com:80/path/',
        'https://google.com/path?query=1',
        'http://google.com:80/path?query=1&asd=true#hash',
    ];

    urls.forEach(url => {
        const scheme = new Validator({
            url: 'url',
        });

        const res = scheme.validate({
            url,
        });

        expect(res.result).toBe(true);
    });
});

test('Should correctly handle invalid URLs', () => {
    const invalidUrls = [
        "google.com",
        "htp://google.com",
        "http://google",
        "http://google..com",
        "http://google.com:",
        "http://google.com:123456",
    ];

    invalidUrls.forEach(url => {
        const scheme = new Validator({
            url: 'url',
        });

        const res = scheme.validate({
            url,
        });

        expect(res.result).toBe(false);
    });
});
