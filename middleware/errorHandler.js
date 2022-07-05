const ErrorCatcher = require("../utils/errorCatcher");


const errorHandler = (err, req, res, next) => {
    const errors = { ...err };
    errors.message = err.message;
    
    console.log(err);

    //Token Conflict
    if(err.name === "JsonWebTokenError"){
        const message = "Conflict detected authorization denied!";
        errors = new ErrorCatcher(message, 401)
    }

    //Handling Unique Key Error
    if(err.code === 11000){
        const message = "Duplicated key error: document Id already exist";
        errors = new ErrorCatcher(message, 400)
    }
   

     //Search Params not found
     if(err.name === "CastError"){
        const message = `No document match your search id of ${err.value}`;
        errors = new ErrorCatcher(message, 404)
    }


    res.status(errors.statusCode || 500).json({
        success: false,
        error: errors.message
    })
};


module.exports = errorHandler;