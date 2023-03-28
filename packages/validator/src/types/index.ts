import { ValidatorNestedSchema, ValidatorArraySchema, ValidatorOrSchema } from "src/validator-helpers";

export const SCHEME_TYPES = {
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

export type ValidateResult = { result: boolean, errors: string[] };

export type SchemeTypes = typeof SCHEME_TYPES[keyof typeof SCHEME_TYPES];

export type ShemeExtendedType = { type: SchemeTypes, validate: ValidateFn };

export type ValidateFn = (value: any) => boolean;

export type ObjectSchema = {
    [key: string]:
        | SchemeTypes
        | ShemeExtendedType
        | ValidatorNestedSchema
        | ValidatorArraySchema
        | ValidatorOrSchema
};

export type ValidatableObj = Record<string, unknown>;
