async function authentification(req, res, next) {
    // Authentification fictive
    req.user = { _id: "mockId", isDeleted: false, authTokens: [] };
    req.auth = "mockToken";
    next();
}
module.exports = { authentification };
