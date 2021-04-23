exports.statusCode = {
    success: 200,
    error: 500,
    notfound: 404,
    unauthorized: 401,
    conflict: 409,
    created: 201,
    bad: 400,
    nocontent: 204,
  };
  
  exports.returnJsonResponse = (statuscode, statusmsg, msg, data = []) => {
    const response = {
      statusCode: statuscode,
      status: statusmsg,
      message: msg,
      data: data,
    };
  
    return response;
  };
  
  exports.returnErrorJsonResponse = (statuscode, statusmsg, msg, error = []) => {
    const response = {
      statusCode: statuscode,
      status: statusmsg,
      message: msg,
      error: error,
    };
  
    return response;
  };
  