import { Response } from "express";

const sendRequiredParameterMissingError = (
  res: Response,
  message: string = ""
) => {
  console.log(
    `[ResponseNamespace.sendRequiredParameterMissingError] Bad Request. Parameters are missing. ${message}`
  );
  sendError(res, 400, `Bad Request. Parameters are missing. ${message}`);
};

const sendError = (res: Response, statusCode: number, message: string = "") => {
  console.error(
    "[ResponseNamespace.sendError] Sending Error Response.",
    message
  );

  const body = {
    errors: true,
    code: res.status(statusCode).statusCode,
    message: message,
  };
  res.send(body);
};

const sendSuccess = (
  res: Response,
  statusCode: number,
  data: any,
  message: string = ""
) => {
  console.log(
    "[ResponseNamespace.sendSuccess] Sending Success Response.",
    message
  );

  const body = {
    errors: false,
    data: data,
    code: res.status(statusCode).statusCode,
    message: message,
  };
  res.send(body);
};

const ResponseNamespace = {
  sendSuccess,
  sendError,
  sendRequiredParameterMissingError,
};

export default ResponseNamespace;
