const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const {
  userInfoModel,
  userModel
} = require("../../models/userModel");


const jwt = require("jsonwebtoken");
const validator = require("../../validators/userValidator")
const { messages } = require("../../utils/responseMessages")
const tokenGenerator = require("../../utils/tokenGenerator")

const userService = require("../../services/userServices")


//------------------------------------------------------
//          REGISTER COME LOGIN USER
//------------------------------------------------------
//@desc Register a user
//@route POST /api/users/register
//@access public

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, login_after_register } = req.body;

  const { error } = validator.validateRegisterUser(username, email, password, login_after_register);
  if (error) { res.status(403); throw new Error(`${error}`); };

  const userAvailable = await userService.findUser(email);

  if (userAvailable) { res.status(400); throw new Error(messages.user.mes_1); };

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userService.createUser(username, email, hashedPassword);

  if (req.header("v2_header") === "web") {
    if (user) {
      res.status(201).json({ message: messages.user.mes_4 })
    } else {
      res.status(400);
      throw new Error(messages.user.mes_2);
    }
  }
  if (user) {
    if (login_after_register === "true") {

      const token = await tokenGenerator.generateToken(password, user);

      res.status(201).json({ message: messages.user.mes_3, token });
    } else {
      res.status(201).json({ message: messages.user.mes_4 })
    };
  } else {
    res.status(400);
    throw new Error(messages.user.mes_2);
  }
});




//------------------------------------------------------
//          USER LOGIN
//------------------------------------------------------
//@desc user login
//@route GET /api/users/login
//@access public


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { error } = validator.validateLoginUser(email, password);
  if (error) { res.status(403); throw new Error(`${error}`); }

  const user = await userService.findUser(email);
  if (!user) { res.status(400); throw new Error(messages.user.mes_6); };

  if (req.header("v2_header") === "web") {
    if (await bcrypt.compare(password, user.password_hash)) {

      res.status(200).json({ username: user.username, email: user.email, _id: user._id });
    }
    else {
      res.status(401); throw new Error(messages.user.mes_7);
    }
  } else {
    const accessToken = await tokenGenerator.generateToken(password, user);

    if (accessToken) {
      res.status(200).json({ message: messages.user.mes_5, accessToken })
    }
    else {
      res.status(401); throw new Error(messages.user.mes_7);
    }
  }
});



//------------------------------------------------------
//         CURRENT USER 
//------------------------------------------------------



//@desc current user info
//@route GET /api/users/current
//@access private

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});


//------------------------------------------------------
//          USER INFO - CREATE/UPDATE
//------------------------------------------------------

//@desc Create User info
//@route POST /api/users/user-info
//@access private

const createUpdateUserInfo = asyncHandler(async (req, res) => {
  const { first_name, last_name, dob, profession, interests, about, user_id } = req.body;

  // const { user_id } = req.params.id;

  const { error } = validator.validateUserInfo(first_name, last_name, dob, profession, interests, about);
  if (error) { res.status(403); throw new Error(`${error}`); };

  let date = new Date(dob)
  let dat = date.toISOString()

  const u_id = (req.header("v2_header") === "web") ? user_id : req.user.id;


  const userInfoAvailable = await userService.findUserInfo(u_id);

  if (!userInfoAvailable) {
    userInfo = await userService.createUserInfo(u_id, first_name, last_name, dob, profession, interests, about);


    if (userInfo) {
      res.status(201).json({
        User_Info_created: {
          name: `${userInfo.first_name} ${userInfo.last_name}`,
          dob: userInfo.dob,
          profession: userInfo.profession,
          interests: userInfo.interests,
          about: userInfo.about,
        },
      });
    }
  } else {
    try {
      const updatedInfo = await userService.updateUserInfo(u_id, first_name, last_name, dat, profession, interests, about);
      res.status(200).json({
        updated_info: {
          name: `${updatedInfo.first_name} ${updatedInfo.last_name}`,
          dob: updatedInfo.dob,
          profession: updatedInfo.profession,
          interests: updatedInfo.interests,
          about: updatedInfo.about
        }
      });
    } catch {
      res.status(400);
      throw new Error(messages.user.mes_2);
    }
  }
});



//------------------------------------------------------
//          CURRENT(LOGGED IN) USER INFO
//------------------------------------------------------
//@desc current user info
//@route GET /api/users/current
//@access private

const currentUserInfo = asyncHandler(async (req, res) => {

  // const userInfo = await userService.findUserInfo(req.user.id);
  const u_id = (req.header("v2_header") === "web") ? req.params.id : req.user.id;

  const userInfo = await userService.findUserInfo(id = u_id);
  if (!userInfo) {
    res.status(204);
    throw new Error(messages.user.mes_8);

  } else {
    res.status(200).json({ userInfo });

  }
});

//---------------------------------------------------------------


// Module Export
module.exports = { registerUser, loginUser, currentUser, createUpdateUserInfo, currentUserInfo };



