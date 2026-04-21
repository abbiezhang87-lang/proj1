class CustomAPIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'CustomAPIError'; // 方便排查和日志过滤
    }
}

export default CustomAPIError;