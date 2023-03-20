import { REGEXP } from "./constants";

const SCHEME_TYPES = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'array',
    'null': 'null',
    'email': 'email',
    'url': 'url',
    'uuid': 'uuid',
    'hex': 'hex',
    'hexColor': 'hexColor',
    'creditCard': 'creditCard',
    'phone': 'phone',
    'ipv4': 'ipv4',
    'ipv6': 'ipv6',
    'json': 'json',
    'base64': 'base64',
} as const;

type ValidateResult = { result: boolean, errors: string[] };

type SchemeTypes = typeof SCHEME_TYPES[keyof typeof SCHEME_TYPES];

type ShemeExtendedType = { type: SchemeTypes, validate: ValidateFn };

type ValidateFn = (value: any) => boolean;

type ObjectSchema = {
    [key: string]:
        | SchemeTypes
        | ShemeExtendedType
        | ValidatorNestedSchema
        | ValidatorArraySchema;
};

type ValidatableObj = Record<string, unknown>;

const validateWithRegexp = (props: {
    field: string, value: any, re: RegExp, validateFn?: ValidateFn
}): ValidateResult => {
    const { field, value, re, validateFn } = props;
    let message = '';
    const result = validateFn ? validateFn(value) : re.test(value);
    if (!result) {
        const reason = validateFn ? 'because validate function returned false' : `${value} does not match the regexp ${re.toString()}`;
        message = `Field ${field} is invalid, ${reason}`;
    }
    return { result, errors: [message] };
}

class ValidatorNestedSchema {
    constructor(
        private _schema: ObjectSchema
    ) {}

    get schema(): ObjectSchema {
        return this._schema;
    }
}

class ValidatorArraySchema {
    constructor(
        private _schema: ObjectSchema | SchemeTypes
    ) {}

    get schema(): ObjectSchema | SchemeTypes {
        return this._schema;
    }
}

export class Validator {
    private count = 0;

    constructor(
        private schema: ObjectSchema,
        private options = {} as Partial<{ fixme: 'add options' }>, 
        private maxDepth = 100
    ) {}
    
    static nested(schema: ObjectSchema): ValidatorNestedSchema {
        return new ValidatorNestedSchema(schema);
    }
    
    static arrayOf(schema: ObjectSchema | SchemeTypes): ValidatorArraySchema {
        return new ValidatorArraySchema(schema);
    }

    validate(obj: ValidatableObj, schema = this.schema, errors = [] as string[]): ValidateResult {
        this.count++;
        if (this.count > this.maxDepth) {
            throw new Error(`
Max depth of validation is reached
Max depth: ${this.maxDepth}
            `)
        }
        for (const field of Object.keys(obj)) {
            let schemaType = schema[field];
            
            if (!schemaType) {
                console.dir({
                    field,
                    schema,
                })
                throw new Error(`
Validator hasn't this field in scheme
Field: ${field}
                `)
            }

            // @ts-expect-error validate exists
            const validateFn: ValidateFn = schemaType?.validate ?? null;
            const value = obj[field];

            if (typeof value === 'object' && Array.isArray(value) && typeof schemaType === 'object' && schemaType instanceof ValidatorArraySchema) {
                const schemaOrShemaType = schemaType.schema;
                for (const v of value) {
                    let result = { result: false, errors: [`Field ${field} has not matched with scheme`] };
                    if (typeof v === 'object' && typeof schema === 'object') {
                        // @ts-expect-error scheme is valid
                        result = this.validate(v, schemaOrShemaType, errors);
                    }
                    else if (typeof v !== 'object' && (typeof schemaOrShemaType === 'string' || schemaOrShemaType?.validate)) {
                        // @ts-expect-error scheme is valid
                        result = this.validate({ [field]: v }, { [field]: schemaOrShemaType }, errors);
                    }

                    if (!result?.result) {
                        return result;
                    }
                }
                continue;
            } else if (typeof value === 'object' && typeof schemaType === 'object' && schemaType instanceof ValidatorNestedSchema) {
                const result = this.validate(value as ValidatableObj, schemaType.schema, errors);
                if (!result.result) {
                    return result;
                }
                continue;
            } else if (typeof value !== 'object' && typeof schemaType === 'object' && schemaType instanceof ValidatorNestedSchema) {
                return { result: false, errors: [`Field ${field} has not matched with scheme`] };
            } else if (typeof schemaType === 'object' && typeof (schemaType as ShemeExtendedType)?.type === 'string' && SCHEME_TYPES[(schemaType as ShemeExtendedType).type]) {
                schemaType = (schemaType as ShemeExtendedType).type as SchemeTypes;
            }

            if (typeof schemaType === 'string' && !SCHEME_TYPES[schemaType]) {
                throw new Error(`
Validator can't handle passed type
Type: ${schemaType}
Available types: ${Object.keys(SCHEME_TYPES).join(', ')}
                `)
            }

            if (!schemaType || typeof schemaType !== 'string') {
                throw new Error(`
Unexpected type for validation
Type: ${schemaType}
                `)
            }

            switch (schemaType) {
                case 'array':{
                    const result = Array.isArray(value);
                    if (!result) {
                        errors.push(`Field ${field} is not an array`);
                        return { result, errors };
                    }
                    break;
                }
                case 'json': {
                    try {
                        const result = validateFn ? validateFn(value) : JSON.parse(value as string);
                        if (!result) {
                            const reason = 'because validate function returned false';
                            errors.push(`Field ${field} is not a json, ${reason}`);
                            return { result: Boolean(result), errors };
                        }
                        
                    } catch (e) {
                        errors.push(`Field ${field} is not a json`);
                        return { result: false, errors };
                    }
                    break;
                }
                case 'email': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.EMAIL, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'url': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.URL, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'uuid': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.UUID, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'base64': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.BASE64, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'hex': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.HEX, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'hexColor': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.HEX_COLOR, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'creditCard': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.CREDIT_CARD, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'ipv4': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.IPV4, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'ipv6': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.IPV6, validateFn
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'number':
                case 'string':
                case 'boolean':
                    if (typeof value !== schemaType) {
                        errors.push(`Field ${field} is not a ${schemaType}`);
                        return { result: false, errors };
                    }
                    break;

                default:
                    throw new Error(`
Unexpected type for validation
Type: ${schemaType}, default case
                    `)
            }
        }

        return { result: errors.length === 0, errors };
    }
}