import { Router } from "express";
import { authenticateToken } from "../middleware/auth.ts";
import { createEntry } from "../controllers/entryController.ts";
import { validateParams } from "../middleware/validation.ts";
import z from "zod";

const router = Router()
router.use(authenticateToken)

const uuidSchema = z.object({
    id: z.uuid('Invalid habit ID format'),
})

//body params automatically handled in frontend.
router.post('/:id', validateParams(uuidSchema), createEntry)
