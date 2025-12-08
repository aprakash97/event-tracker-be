import { Router } from "express";
import { z } from 'zod'
import { validateBody, validateParams } from "../middleware/validation.ts";
import { authenticateToken } from "../middleware/auth.ts";
import { createHabit, deleteHabit, getHabitById, getUserHabits, updateHabit } from "../controllers/habitController.ts";

const router = Router()

//apply authentication to all routes
router.use(authenticateToken)

// Validation schemas
const createHabitSchema = z.object({
    name: z.string().min(1, 'Habit name is required').max(100, 'Name too long'),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly'], {
        error: () => ({
            message: 'Frequency must be daily, weekly, or monthly',
        }),
    }),
    targetCount: z.number().int().positive().optional().default(1),
    tagIds: z.array(z.uuid()).optional(),
})

const updateHabitSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    targetCount: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    tagIds: z.array(z.uuid()).optional(),
})

const uuidSchema = z.object({
    id: z.uuid('Invalid habit ID format'),
})

//get
router.get('/', getUserHabits)

//get single habit
router.get('/:id', validateParams(uuidSchema), getHabitById)

//create
router.post('/', validateBody(createHabitSchema), createHabit)

//update
router.patch('/:id', validateParams(uuidSchema), validateBody(updateHabitSchema), updateHabit)

//delete
router.delete('/:id', validateParams(uuidSchema), deleteHabit)

//TODO
router.post('/:id/complete', validateParams(uuidSchema), validateBody(createHabitSchema), (req, res) => {
    res.json({ message: 'Completed habit' })
})

export default router