import { Router } from "express";

const router = Router()

router.post('/register', (req, res) => {
    res.status(201).json({ message: 'User signed in successfully!' })
})

router.post('/login', (req, res) => {
    res.status(201).json({ message: 'User logged in successfully!' })
})

export default router
//Module is a closure, closure is just a function
//Functions cant reach inside a function unless the function returns something
//in the first place