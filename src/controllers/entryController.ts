import type { Response } from 'express'
import db from "../db/connection.ts";
import { entries } from "../db/schema.ts";
import { AuthenticatedRequest } from "../middleware/auth.ts";

export const createEntry = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const id = req.params.id  //habit ID
        const { completionDate, note } = req.body

        const result = await db.transaction(async (tx) => {
            const [newEntry] = await tx.insert(entries).values({
                habitId: id,
                completionDate, // time
                note,
            }).returning()

            return newEntry
        })

        if (!result) {
            res.status(404).json({ message: 'Oops! something went wrong!' })
        }

        res.status(201).json({ message: 'Successfully entry added!' })

    } catch (e) {
        console.error('Create Habit error', e)
        res.status(500).json({ error: 'Failed to create new habit' })
    }
}