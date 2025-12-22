function asyncHandler(fn) {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next);
      return result;
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
export default asyncHandler;
