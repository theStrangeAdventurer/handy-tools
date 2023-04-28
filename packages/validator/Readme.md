# Validator

🎸 Dependency free fancy validator for objects.


## Installation

```bash
npm install @handy-tools/validator@latest
```

## Usage

```javascript
import { Validator } from '@handy-tools/validator';

const scheme = new Validator({
    name: 'string',
    age: 'number',
    emails: Validator.nested({
        gmailEmail: {
            type: 'email',
            required: true, // true is default value
            // Custom validation function
            errorMessage: 'Gmail email is required',
            // Custom validation function
            validate: (value) => {
                return value?.includes('@gmail.com');
            }
        },
        optionalEmail: {
            type: 'email',
            required: false,
        },
    }),
    extra: Validator.nested({
        ip: 'ipv4',
        ipv6: 'ipv6',
    })
});
const res = scheme.validate({
    name: 'John',
    age: 20,
    emails: {
        gmailEmail: 'some@gmail.com',
        optionalEmail: '',
    },
    extra: {
        ip: '192.168.0.34',
        ipv6: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    }
}); // { result: true, errors: {} }

const ipScheme = new Validator({
    ip: 'ipv4',
});

const res = ipScheme.validate({
    ip: 'not an ip',
}); // { result: false, errors: { ip: 'Field is invalid' } }
```

See [tests](./__tests__/common.ts) for more examples.