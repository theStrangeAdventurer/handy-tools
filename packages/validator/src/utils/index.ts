import { ValidateFn, ValidateResult } from "src/types";

export const validateWithRegexp = (props: {
    field: string, value: any, re: RegExp, validateFn?: ValidateFn; errorMessage?: string;
}): ValidateResult => {
    const { field, value, re, validateFn, errorMessage } = props;
    let message = '';
    const result = validateFn ? validateFn(value) : re.test(value);
    if (!result) {
        const reason = validateFn ? 'because validate function returned false' : `${value} does not match the regexp ${re.toString()}`;
        message = errorMessage ?? `Field is invalid, ${reason}`;
    }
    return { result, errors: { [field]: message } };
}
