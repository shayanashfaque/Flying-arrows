// middleware/requireLoginKey.js
module.exports = (req, res, next) => {
    if (req.params.key !== process.env.LOGIN_ACCESS_KEY) {
        return res.status(404).send("Not Found");
    }
    next();
};
