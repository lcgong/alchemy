
/*jshint esversion: 6 */

export class InvalidDataError extends Error {
    constructor(error) {
        super(error);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError);
        }

        this.name = 'InvalidDataError';
    }
}
