const AppError = require("../utils/appError");

const handleCastErrorDB=err=>{
    const message=`Invalid ${err.path} : ${err.value} .`
    return new AppError(message,400);
}
const handleDuplicateFieldsDB=err=>{
    const value=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
     const message=`Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message,400);
}
const handleValidationErrorDB=err=>{
    const errors=Object.values(err.errors).map(el=>el.message);
   // const message=`Invalid input data ${errors.join('. ')}`;
   const message=`${errors.join('. ')}`;
    return new AppError(message,400); 
}
const sendErrorDev = (err, res) => {

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}
const sendErrorProd = (err, res) => {
    //Operational, trusted error:send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message  
        });

        ///Programming or other unknow error : don't leak error details to client
    }else{
        //1/Log error

        console.error('ERROR 🔥',err);

        //2/Generic message
        res.status(500).json({
            status:'error',
            message:'Something went very wrong!'
        })
    }


}

const handleJWTError=err=>new AppError('Invalid token. Please log in again!',401);

const handleJWTExpiredError=err=>new AppError('Your token has expired ! Please log in again',401);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
     if (process.env.NODE_ENV === 'development') {
       
        let error_dev={...err};
       
        if(error_dev.name==='CastError') error_dev=handleCastErrorDB(error_dev);
        if(error_dev.code===11000)error_dev=handleDuplicateFieldsDB(error_dev);
        if(error_dev.name==='ValidationError') error_dev=handleValidationErrorDB(error_dev);
        if(error_dev.name==='JsonWebTokenError') error_dev=handleJWTError(error_dev);
        if(error_dev.name==='TokenExpiredError') error_dev=handleJWTExpiredError(error_dev);

      // sendErrorDev(error_dev, res); //in prod

         sendErrorDev(err, res); //in dev mode

    } else if (process.env.NODE_ENV === 'production') {
       let error={...err};
        if(error.name==='CastError') error=handleCastErrorDB(error)


        sendErrorProd(error, res);

    }

};
