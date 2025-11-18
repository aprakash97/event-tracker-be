import { Router } from "express";
import { z } from 'zod'
import { validateBody, validateParams } from "../middleware/validation.ts";

const router = Router()

const completeHabitSchema = z.object({
    id: z.string()
})

const createHabitSchema = z.object({
    name: z.string(),
    durationPlanned: z.number().positive()
})

router.get('/', (req, res) => {
    res.json({ message: 'habits' })
})

router.get('/:id', (req, res) => {
    res.json({ message: 'got one habit' })
})

router.post('/', validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Successfully created' }).status(201)
})

router.delete('/:id', (req, res) => {
    res.json({ message: 'Successfully deleted' })
})

router.post('/:id/complete', validateParams(completeHabitSchema), validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Completed habit' })
})

export default router