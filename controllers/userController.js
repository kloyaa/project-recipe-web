require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { COOKIE_OPTIONS } = require("../common/const/http");
const { validationResult } = require("express-validator");
const { throwError } = require("../common/utils/errorMessages");
const { validatorLogin, validatorRegistration, validatorChangePass, validatorLogout } = require("../common/const/express_validators");

const User = require("../models/user");
const RefreshToken = require("../models/tokens");
const { jwtRefreshToken, jwtAccessToken } = require("../common/utils/encodeAndDecodeJwtToken");

const SALT_ROUNDS = 12;

const pathLogin = "/api/login";
const pathLogout = "/api/logout";
const pathRegisartion = "/api/registration";
const pathChangePassword = "/api/change-password";


// @DESC Login user
router.post(pathLogin, validatorLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res
            .status(400)
            .json({ message: "Account not found" });

        bcrypt.compare(password, user.hashValue, async (err, result) => {
            if (err || !result) return throwError(res, 403);
            const accountId = user._id.toString();
            const refreshToken = jwtRefreshToken(accountId);
            const accessToken = jwtAccessToken(accountId);

            // Store RT in db
            await new RefreshToken({ refreshToken }).save();

            return res.status(200)
                .cookie('accessToken', accessToken, COOKIE_OPTIONS)
                .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
                .json({ accountId, email });
        });

    } catch (error) {
        console.log(error);
    }
});

// @DESC Register user
router.post(pathRegisartion, validatorRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) return throwError(res, 400, "Email is currently in used");

        await bcrypt.hash(password, SALT_ROUNDS)
            .then(async (hashValue) => {
                new User({ email, hashValue })
                    .save()
                    .then((value) => {
                        const accountId = value._id.toString();
                        const refreshToken = jwtRefreshToken(accountId);
                        const accessToken = jwtAccessToken(accountId);

                        return res.status(200)
                            .cookie('accessToken', accessToken, COOKIE_OPTIONS)
                            .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
                            .json({ accountId, email });
                    })
                    .catch(err => res
                        .status(400)
                        .json({ message: err }));
            });

    } catch (error) {
        console.log(error);
    }
});

// @DESC Change user password
router.post(pathChangePassword, validatorChangePass, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json(errors.array());

        const { email, password, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res
            .status(400)
            .json({ message: "Account not found" });

        bcrypt.compare(password, user.hashValue, async (err, result) => {
            if (err || !result) return res
                .status(400)
                .json({ message: "Password does not matched" })

            const hashValue = await bcrypt.hash(newPassword, SALT_ROUNDS);
            return User.findOneAndUpdate({ email }, { hashValue }, { new: true })
                .then(value => {
                    const accountId = value._id.toString();
                    const refreshToken = jwtRefreshToken(accountId);
                    const accessToken = jwtAccessToken(accountId);
                    return res.status(200)
                        .cookie('accessToken', accessToken, COOKIE_OPTIONS)
                        .cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
                        .json({ accountId, email });
                })
                .catch(err => res
                    .status(400)
                    .json({ message: err }));
        });

    } catch (error) {
        console.log(error);
    }
})

// @DESC Logout user
router.delete(pathLogout, validatorLogout, (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return throwError(res, 400, errors.array());

        const refreshToken = req.cookies.refreshToken;
        RefreshToken.findOneAndDelete({ refreshToken })
            .then(value => res.status(200).json({ message: "Logout successful" }))
            .catch(err => res
                .status(400)
                .json({ message: err }));
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
