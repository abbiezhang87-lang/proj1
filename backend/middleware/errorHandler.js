const errorHandler = (err, req, res, next) => {

    if (res.headersSent) return next(err);

    let statusCode = err.statusCode || res.statusCode || 500;
    if (statusCode < 400) statusCode = 500;

    let message = err.message || 'Server error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((e) => e.message)
            .join(', ');
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `Duplicate value for ${field}`;
    }

    res.status(statusCode).json({
        message,

        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};

export const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Not found - ${req.originalUrl}`));
};

export default errorHandler;