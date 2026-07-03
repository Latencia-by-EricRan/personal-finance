class ServiceError extends Error {

    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = 'ServiceError';
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ServiceError.prototype);
    }

}

export {
    ServiceError,
};
