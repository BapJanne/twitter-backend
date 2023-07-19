const express = require("express");

import { check } from "express-validator";

const usersControllers = require("../controllers/users-controller");

const router = express.Router();

router.get("/:userName", usersControllers.getUserData);

router.post("/login", usersControllers.login);

router.post(
  "/signup",
  [
    check("userName").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

module.exports = router;
