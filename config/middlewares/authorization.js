/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        console.log("User is not authorized");
        //return res.send(401, 'User is not authorized');
        return res.redirect('/');
    }
    next();
};

exports.requiresLogout = function(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("Operation cannot proceed. User is still logged in");
        //return res.send(401, 'User is not authorized');
        return res.redirect('/');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

exports.csrf = function csrf(req, res, next) {
  res.locals.csrftoken = req. req.csrfToken();
  next();
}

/**
 * Article authorizations routing middleware
 */
exports.article = {
    hasAuthorization: function(req, res, next) {
        if (req.article.user.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};
