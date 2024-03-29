import { REGEXP } from "./constants";
import { ObjectSchema, SchemeTypes, ValidatableObj, ValidateResult, ShemeExtendedType, SCHEME_TYPES, ValidationErrors } from "./types";
import { validateWithRegexp } from "./utils";
import { ValidatorNestedSchema, ValidatorArraySchema, ValidatorOrSchema } from "./validator-helpers";

class Validator {
    private count = 0;
    static REGEXP = REGEXP;

    constructor(
        private schema: ObjectSchema,
        private options = {} as Partial<{ validateExtraFields: boolean }>, 
        private maxDepth = 100
    ) {}
    
    static nested(schema: ObjectSchema): ValidatorNestedSchema {
        return new ValidatorNestedSchema(schema);
    }
    
    static arrayOf(schema: ObjectSchema | SchemeTypes): ValidatorArraySchema {
        return new ValidatorArraySchema(schema);
    }

    static or(schema: Array<ObjectSchema | SchemeTypes>): ValidatorOrSchema {
        return new ValidatorOrSchema(schema);
    }

    validate(
        obj: ValidatableObj,
        schema = this.schema, /* Need for Recursive calls */
        errors = {} as ValidationErrors,  /* Need for Recursive calls */
        isOr = false, /* Need for Recursive calls */
        isRecursive = false  /* Need for Recursive calls and reset nesting count */
    ): ValidateResult {
        if (!isRecursive)
            this.count = 0;
        this.count++;
        const objectKeys = Object.keys(obj);
        const schemaKeys = Object.keys(schema);
        const incompatibleKeys = schemaKeys.filter(key => !objectKeys.includes(key));

        if (incompatibleKeys.length) {
            const errors = incompatibleKeys.reduce((acc, key) => {
                acc[key] = `Object is incompatible with scheme: hasn't this '${key}' field`;
                return acc;
            }, {} as ValidationErrors);
            
            return { result: false, errors };
        }
        if (this.count > this.maxDepth) {
            
            throw new Error(`
Max depth of validation is reached
Max depth: ${this.maxDepth}
            `)
        }
        for (const field of Object.keys(obj)) {
            let schemaType = schema[field];
            if (!schemaType && isOr) {
                
                return { result: false, errors: { common: 'Schema not compatible with object' } };
            }
            if (!schemaType) {
                const errMessage = `Validator hasn't this field in scheme
Field: ${field}
Scheme: ${JSON.stringify(schema, null, 2)}
`
                if (this.options.validateExtraFields) {
                    return { result: false, errors: { [field]: errMessage } };
                } else {
                    // Skip this field if it's not in scheme
                    continue;
                }
            }

            // @ts-expect-error validate exists
            const validateFn: ValidateFn = schemaType?.validate ?? null;
            // @ts-expect-error errorMessage exists
            const errorMessage = schemaType?.errorMessage ?? null;
            // @ts-expect-error required exists
            const isRequired = typeof schemaType?.required === 'undefined' ? true : Boolean(schemaType?.required);
            const value = obj[field];
            const convertToSchema = (sh: ObjectSchema | SchemeTypes): ObjectSchema => {
                if (typeof sh === 'string') {
                    return { [field]: sh };
                }
                return sh;
            }
            const convertValueToValidationObj = (v: unknown): ValidatableObj => {
                if (typeof v === 'object') {
                    return v as ValidatableObj;
                }
                return { [field]: v };
            }
            if ((typeof value === 'undefined' || value === '')  && !isRequired) {
                continue;
            }
            if (!Array.isArray(value) && schemaType instanceof ValidatorOrSchema) {
                const _schemas = schemaType.schema.map(convertToSchema);
                const _validatableObj = convertValueToValidationObj(value);
                
                const results = _schemas.map(_scheme => {
                    const result = this.validate(_validatableObj, _scheme, errors, true, true)
                    return result;
                });
                if (results.some(r => r.result)) {
                    continue;
                }
                
                return { result: false, errors: results.reduce((acc, r) => {
                    return Object.assign(acc, r.errors);
                }, {} as ValidationErrors) };
            } else if (typeof value === 'object' && Array.isArray(value) && schemaType instanceof ValidatorArraySchema) {
                const _schema = convertToSchema(schemaType.schema);
                const _values = value.map(convertValueToValidationObj);
                for (const v of _values) {
                    const result = this.validate(v, _schema, errors, false, true);

                    if (!result?.result)
                        return result;
                }
                continue;
            } else if (typeof value === 'object' && typeof schemaType === 'object' && schemaType instanceof ValidatorNestedSchema) {
                const result = this.validate(value as ValidatableObj, schemaType.schema, errors, false, true);
                if (!result.result)
                    return result;
                continue;
            } else if (typeof value !== 'object' && typeof schemaType === 'object' && schemaType instanceof ValidatorNestedSchema) {
                return { result: false, errors: { [field]: `Field has not matched with scheme` } };
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

            if (validateFn) {
                const result = validateFn(value);
                if (!result) {
                    const reason = 'because validate function returned false';
                    errors[field] = errorMessage ?? `Field is not valid, ${reason}`;
                    return { result: Boolean(result), errors };
                } else {
                    continue;
                }
            }

            if (!schemaType || typeof schemaType !== 'string') {
                console.log({ schemaType })
                
                throw new Error(`
Unexpected type for validation
Type schemaType: ${schemaType}
                `)
            }

            switch (schemaType) {
                case 'array':{
                    const result = Array.isArray(value);
                    if (!result) {
                        errors[field] = `Field is not an array`;
                        
                        return { result, errors };
                    }
                    break;
                }
                case 'json': {
                    try {
                        const result = validateFn ? validateFn(value) : JSON.parse(value as string);
                        if (!result) {
                            const reason = 'because validate function returned false';
                            errors[field] = errorMessage ?? `Field is not a json, ${reason}`;
                            return { result: Boolean(result), errors };
                        }
                        
                    } catch (e) {
                        errors[field] = errorMessage ?? `Field ${field} is not a json`;
                        return { result: false, errors };
                    }
                    break;
                }
                case 'email': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.EMAIL, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'url': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.URL, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'uuid': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.UUID, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'base64': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.BASE64, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'hex': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.HEX, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'hexColor': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.HEX_COLOR, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'creditCard': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.CREDIT_CARD, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'ipv4': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.IPV4, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'ipv6': {
                    const res = validateWithRegexp({
                        field, value, re: REGEXP.IPV6, validateFn, errorMessage
                    });
                    if (!res.result)
                        return res;
                    break;
                }
                case 'number':
                case 'string':
                case 'boolean':
                    if (typeof value !== schemaType) {
                        errors[field] = errorMessage ?? `Field is not a ${schemaType}`;
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
        
        return { result: Object.keys(errors).length === 0, errors };
    }
}

export {
    Validator
}