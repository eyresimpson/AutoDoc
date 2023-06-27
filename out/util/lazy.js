"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lazy = void 0;
/**
 * @see {@link https://docs.microsoft.com/en-us/dotnet/framework/performance/lazy-initialization}
 */
class Lazy {
    constructor(factory) {
        this._isValueCreated = false;
        this._value = null;
        this._factory = factory;
    }
    get isValueCreated() {
        return this._isValueCreated;
    }
    get value() {
        if (!this._isValueCreated) {
            this._value = this._factory();
            this._isValueCreated = true;
        }
        return this._value;
    }
}
exports.Lazy = Lazy;
//# sourceMappingURL=lazy.js.map