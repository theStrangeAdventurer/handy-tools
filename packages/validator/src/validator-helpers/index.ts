import { ObjectSchema, SchemeTypes } from "src/types";

export class ValidatorNestedSchema {
    constructor(
        private _schema: ObjectSchema
    ) {}

    get schema(): ObjectSchema {
        return this._schema;
    }
}

export class ValidatorArraySchema {
    constructor(
        private _schema: ObjectSchema | SchemeTypes
    ) {}

    get schema(): ObjectSchema | SchemeTypes {
        return this._schema;
    }
}

export class ValidatorOrSchema {
    constructor(
        private _schema: Array<ObjectSchema | SchemeTypes>
    ) {}

    get schema(): Array<ObjectSchema | SchemeTypes> {
        return this._schema;
    }
}