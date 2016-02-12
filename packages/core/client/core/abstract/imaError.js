
/*

 This file exists only because babel dropped the support for extending native
 classes :-/

 */

/**
 * Initializes the error.
 *
 * @method constructor
 * @param {string} message The message describing the cause of the error.
 * @param {Object<string, *>=} [params={}] A data map providing additional
 *        details related to the error. It is recommended to set the
 *        {@code status} field to the HTTP response code that should be sent
 *        to the client.
 * @param {boolean=} dropInternalStackFrames Whether or not the call stack
 *        frames referring to the constructors of the {@codelink IMAError}
 *        and overriding class(es) should be included in the stack of this
 *        error.
 */
export function constructor(message, params = {},
		dropInternalStackFrames = true) {
	/**
	 * The name of this error, used in the generated stack.
	 *
	 * @property name
	 * @type {string}
	 * @default 'IMAError'
	 */
	this.name = 'IMAError';

	/**
	 * The message describing the cause of the error.
	 *
	 * @property message
	 * @type {string}
	 */
	this.message = message;

	/**
	 * A data map providing additional details related to this error.
	 *
	 * @private
	 * @property _params
	 * @type {Object<string, *>}
	 */
	this._params = params;

	/**
	 * Native error instance we use to generate the call stack. For some reason
	 * the browsers do not generate call stacks for instances of classes
	 * extending the native {@codelink Error} class, so we bypass this
	 * shortcoming like this.
	 *
	 * @private
	 * @property _nativeError
	 * @type {Error}
	 */
	this._nativeError = new Error(message);
	this._nativeError.name = this.name;

	// improve compatibility with Gecko
	if (this._nativeError.columnNumber) {
		this.lineNumber = this._nativeError.lineNumber;
		this.columnNumber = this._nativeError.columnNumber;
		this.fileName = this._nativeError.fileName;
	}

	/**
	 * The internal cache of the generated stack. The cache is filled upon
	 * first access to the {@codelink stack} property.
	 *
	 * @private
	 * @property _stack
	 * @type {?string}
	 */
	this._stack = null;

	/**
	 * Whether or not the call stack frames referring to the constructors of
	 * the {@codelink IMAError} and overriding class(es) should be included
	 * in the stack of this error.
	 *
	 * @private
	 * @property _dropInternalStackFrames
	 * @type {boolean}
	 */
	this._dropInternalStackFrames = dropInternalStackFrames;
}

/**
 * The call stack captured at the moment of creation of this error. The
 * formatting of the stack is browser-dependant.
 *
 * @method getStack
 * @return {string} The call stack captured at the moment of creation of this
 *         error.
 */
export function getStack(implementationClass) {
	if (this._stack) {
		return this._stack;
	}

	var stack = this._nativeError.stack;
	if (typeof stack !== 'string') {
		return undefined;
	}

	// drop the stack trace frames referring to the custom error constructors
	if (this._dropInternalStackFrames) {
		var stackLines = stack.split('\n');

		var inheritanceDepth = 1;
		var currentPrototype = Object.getPrototypeOf(this);
		while (currentPrototype !== implementationClass.prototype) {
			currentPrototype = Object.getPrototypeOf(currentPrototype);
			inheritanceDepth++;
		}
		stackLines.splice(1, inheritanceDepth);

		this._stack = stackLines.join('\n');
	} else {
		this._stack = stack;
	}

	return this._stack;
}

/**
 * Returns the HTTP status to send to the client.
 *
 * This method is a shorthand for the following code snippet:
 * {@code this.getParams().status || 500}.
 *
 * @method getHttpStatus
 * @return {number} The HTTP status to send to the client.
 */
export function getHttpStatus() {
	return this._params.status || 500;
}

/**
 * Returns the error parameters providing additional details about the error.
 * The structure of the returned object is always situation dependent, but
 * the returned object usually contains the {@code status: number} field
 * which represents the HTTP status to send to the client.
 *
 * @method getParams
 * @return {Object<string, *>} The error parameters providing additional
 *         details about the error.
 */
export function getParams() {
	return this._params;
}

/**
 * Returns the name of this error. The name briefly describes this error.
 *
 * @method getName
 * @return {string} The name of this error.
 */
export function getName() {
	return this.name;
}

/**
 * Returns a string representing this error. The string will consist of the
 * error name and message.
 *
 * @method toString
 * @return {string} A string representing this error.
 */
export function toString() {
	return `${this.name}: ${this.message}`;
}
