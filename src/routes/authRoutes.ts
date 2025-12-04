import { Router } from "express";
import { login, register } from "../controllers/authController.ts";
import { validateBody } from "../middleware/validation.ts";
import { insertUserSchema } from "../db/schema.ts";
import { z } from 'zod';

const router = Router()

const loginSchema = z.object({
    email: z.email('invalid email'),
    password: z.string().min(1, 'Password is required')
})

//DB level validations
router.post('/register', validateBody(insertUserSchema), register)

router.post('/login', validateBody(loginSchema), login)

export default router
//Module is a closure, closure is just a function
// Functions cant reach inside a function unless the function returns something
// in the first place

//Signing in
// user sends their email and password, try to locate the user from db using the email,
// if we retrieve user, we'll retrieve their hashed passwords from DB and then we'll compare
// hash password from db <-> user sent password, if they're same we will generate a web token
// and sign them in and send it back(for future request). if not user'll be asked to retry

//Refresh Token
// When validating login, check if it fails, if it fails only due to the reason of expiration
// server will ignore that expiration, as long as client sends a refresh token(which doesn't have expiration date on it)
// using that server will generate a new token and let sign in back -> then client can update
// their local storage with new token

// cookie - local storage - web client
// sqlilite db - mobile client