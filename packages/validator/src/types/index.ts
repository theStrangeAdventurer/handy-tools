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

type FieldNameStr = string;
type ErrorMessageStr = string;

export type ValidationErrors = Record<FieldNameStr, ErrorMessageStr>;

export type ValidateResult = { result: boolean, errors: ValidationErrors };

export type SchemeTypes = typeof SCHEME_TYPES[keyof typeof SCHEME_TYPES];

export type ShemeExtendedType = Partial<{
    type: SchemeTypes;
    validate: ValidateFn;
    errorMessage: string;
    required: boolean;
}>;

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
