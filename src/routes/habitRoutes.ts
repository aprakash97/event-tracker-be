import { Router } from "express";

const router = Router()

router.get('/', (req, res) => {
    res.json({ message: 'habits' })
})

router.get('/:id', (req, res) => {
    res.json({ message: 'got one habit' })
})

router.post('/', (req, res) => {
    res.json({ message: 'Successfully created' }).status(201)
})

router.delete('/:id', (req, res) => {
    res.json({ message: 'Successfully deleted' })
})

router.post('/:id/complete', (req, res) => {
    res.json({ message: 'Completed habit' })
})

export default router