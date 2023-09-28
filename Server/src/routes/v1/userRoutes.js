const express = require("express");
const router = express.Router();


const validateToken = require("../../middleware/validateToken");

let control = require("../../controllers/index");



// const req_verifier = (req, res, next) => {

//     const token = req.header("v2_header");
//     if (token == 'web') {
//         next()
//     } else {
//         validateToken
//     }
//     // append the user object the the request object


//     // call next middleware in the stack
//     next();
// };


//------------------------------------------------------
//         USER ROUTES
//------------------------------------------------------
router.post("/register", control.v1_user.registerUser);
router.post("/login", control.v1_user.loginUser);

router.get("/current", validateToken, control.v1_user.currentUser);


//------------------------------------------------------
//          USER INFO ROUTES
//------------------------------------------------------
router.post("/user-info", validateToken, control.v1_user.createUpdateUserInfo);
router.get("/user-info", validateToken, control.v1_user.currentUserInfo);

router.get("/userinfo/:id", control.v1_user.currentUserInfo);
router.post("/userinfo/:id", control.v1_user.createUpdateUserInfo);



// MODULE EXPORTS
module.exports = router;