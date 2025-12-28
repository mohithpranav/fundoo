function asyncHandler(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      return result;
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}
export default asyncHandler;
