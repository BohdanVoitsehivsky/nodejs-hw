import createHttpError from 'http-errors';


export const errorHandler = ((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  if(err instanceof createHttpError) {
 return res.status(err.status).json({
  error: isProd
  ? "Oops, we had an error, sorry"
  : err.message || err.name,

  });
}


  res.status(500).json({
    error: isProd ? "Oops, we had an error, sorry" : err.message,

  });
});
