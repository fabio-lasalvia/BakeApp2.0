///// Short per errori nei controllers /////

export function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}
