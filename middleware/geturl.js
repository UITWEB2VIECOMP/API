module.exports = function (req, res, next) {
    req.baseUrl = req.protocol + '://' + req.get('host');
    next();
  };