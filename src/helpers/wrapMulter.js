export default function wrapMulter(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        res.status(400).json({ status: 'error', message: err.message });
        return;
      }
      next();
    });
  };
}
