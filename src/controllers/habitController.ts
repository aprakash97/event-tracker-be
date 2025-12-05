import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { eq, and, desc, inArray } from 'drizzle-orm'

export const createHabit = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { name, description, frequency, targetCount, tagIds } = req.body
        const result = await db.transaction(async (tx) => {
            const [newHabit] = await tx.insert(habits).values({
                userId: req.user.id,
                name,
                description,
                frequency,
                targetCount,
            }).returning()

            if (tagIds && tagIds.length > 0) {
                const habitTagValues = tagIds.map((tagId) => ({
                    habitId: newHabit.id,
                    tagId
                }))

                await tx.insert(habitTags).values(habitTagValues)
            }
            return newHabit
        })

        res.status(201).json({
            message: 'Habit created!',
            habit: result
        })
    } catch (e) {
        console.error('Create Habit error', e)
        res.json(500).json({ error: 'Failed to create new habit' })
    }
}

export const getUserHabits = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const userHabitsWithTags = await db.query.habits.findMany({
            where: eq(habits.userId, req.user.id),
            with: {
                habitTags: {
                    with: {
                        tag: true, //include
                    }
                }
            },
            orderBy: [desc(habits.createdAt)]
        })

        const habitsWithTags = userHabitsWithTags.map((habit) => ({
            ...habit,
            tags: habit.habitTags.map((ht) => ht.tag),
            habitTags: undefined,
        }))

        res.status(200).json({
            habits: habitsWithTags
        })

    } catch (e) {
        console.error('Get Habit error', e)
        res.json(500).json({ error: 'Failed to get habits for user' })
    }
}

export const updateHabit = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const id = req.params.id
        const { tagIds, ...updates } = req.body

        const result = await db.transaction(async (tx) => {
            const [updatedHabit] = await tx
                .update(habits)
                .set({ ...updates, updatedAt: new Date() })
                .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
                .returning()

            //rollback transaction
            if (!updatedHabit) {
                res.json(401).end()
            }

            //TODO: CHECK LOGIC
            if (tagIds !== undefined) {
                await tx.delete(habitTags).where(eq(habitTags.habitId, id))

                if (tagIds.length > 0) {
                    const habitTagValues = tagIds.map((tagId) => ({
                        habitId: id,
                        tagId
                    }))

                    await tx.insert(habitTags).values(habitTagValues)
                }
            }
            return updateHabit
        })

        res.status(201).json({
            message: 'Habit was updated',
            habit: result
        })

    } catch (e) {
        console.error('Update Habit error', e)
        res.status(500).json({ error: 'Failed to update habit' })
    }
}