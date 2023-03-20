# Validator

🎸 Fancy validator for objects.


## Installation

```bash
npm install @handy-tools/validator
```

## Usage

```javascript
import { Validator } from '@handy-tools/validator';

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
}); // { result: true, errors: [] }

const ipScheme = new Validator({
    ip: 'ipv4',
});

const res = ipScheme.validate({
    ip: 'not an ip',
}); // { result: false, errors: [ 'Field ip is invalid' ] }
```

See tests for more examples.