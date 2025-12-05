import { Router } from "express";
import { z } from 'zod'
import { validateBody, validateParams } from "../middleware/validation.ts";
import { authenticateToken } from "../middleware/auth.ts";
import { createHabit, getUserHabits, updateHabit } from "../controllers/habitController.ts";

const router = Router()
router.use(authenticateToken)

const completeHabitSchema = z.object({
    id: z.string()
})

//schema
const createHabitSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    frequency: z.string(),
    targetCount: z.number(),
    tagIds: z.array(z.string()).optional()
})

//get
router.get('/', getUserHabits)

router.get('/:id', (req, res) => {
    res.json({ message: 'got one habit' })
})

//create
router.post('/', validateBody(createHabitSchema), createHabit)

//update
router.patch('/:id', validateParams(completeHabitSchema), updateHabit)

router.delete('/:id', (req, res) => {
    res.json({ message: 'Successfully deleted' })
})


router.post('/:id/complete', validateParams(completeHabitSchema), validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Completed habit' })
})

export default router