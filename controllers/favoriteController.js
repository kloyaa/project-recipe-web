const express = require("express");
const router = express.Router();
const { validationResult } = require("express-validator");
const { validatorFavorite } = require("../common/const/express_validators");
const { JWT_REFRESH_SECRET } = require("../common/const/jwt");
const { protected } = require("../common/middlewares/jwtAuthentication");
const { decodeJwtToken } = require("../common/utils/encodeAndDecodeJwtToken");

const Favorite = require("../models/favorites");

// @DESC Add to favorites
router.post("/api/user/favorites", validatorFavorite, protected, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors.array());

        const recipeId = req.body.recipeId;
        const favorite = await Favorite.findOne({ recipeId });
        if (favorite) return res
            .status(400)
            .json({ message: "Recipe already exist" });

        const accountId = decodeJwtToken(req.cookies.refreshToken, JWT_REFRESH_SECRET);

        return new Favorite({ accountId, recipeId })
            .save()
            .then(value => res.status(200).json(value))
            .catch(err => res.status(400).json(err));

    } catch (error) {
        console.log(error)
    }
});

// @DESC Remove from favorites
router.delete("/api/user/favorites/:recipeId", protected, async (req, res) => {
    try {
        const recipeId = req.params.recipeId;
        const accountId = decodeJwtToken(req.cookies.refreshToken, JWT_REFRESH_SECRET);
        return Favorite.findOneAndDelete({ accountId, recipeId })
            .then(value => res.status(200).json(value))
            .catch(err => res.status(400).json(err));
    } catch (error) {
        console.log(error)
    }
});

// @DESC Get all favorites
router.get("/api/user/favorites", protected, (req, res) => {
    const accountId = decodeJwtToken(req.cookies.refreshToken, JWT_REFRESH_SECRET);
    return Favorite.find({ accountId })
        .then(value => res.status(200).json(value))
        .catch(err => res.status(400).json(err));;
});

module.exports = router;