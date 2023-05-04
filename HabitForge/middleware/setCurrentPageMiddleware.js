const setCurrentPage = (pageName) => {
    return (req, res, next) => {
      res.locals.currentPage = pageName;
      next();
    };
  };
  
  module.exports = {
    setCurrentPage,
  };
  