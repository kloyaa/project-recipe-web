const COOKIE_MAX_AGE = 2 * 60 * 60 * 1000;
const COOKIE_OPTIONS = {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    sameSite: "none",
    secure: process.env.NODE_ENV === 'production',
};
const RECIPE_APP_KEY = "63d7eebc0126c653139b26f93a64e1a4";
const RECIPE_APP_ID = "ca6e1286";
const RECIPE_BASE_URL = `https://api.edamam.com/api/recipes/v2`;

module.exports = {
    COOKIE_OPTIONS,
    COOKIE_MAX_AGE,
    RECIPE_BASE_URL,
    RECIPE_APP_KEY,
    RECIPE_APP_ID
}
