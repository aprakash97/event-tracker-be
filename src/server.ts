import express from 'express'

const app = express()

console.log(process.env.port)

//convention to check server is up
app.get('/health', (req, res) => {
    res.json({ message: 'Hello World' }).status(200)
})

export { app } // more option while importing
export default app