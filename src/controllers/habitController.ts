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

//cons
// Security: any user can access any habit if they know the ID.
// No filtering based on authenticated user.
// No relation loading (tags, entries). -  just checking db for relevant row on habits table
// No filtering based on authenticated user.
// No data transformation.
// No ordering of entries.
// No limit on returned entries (if added later)
// No proper 404 handling.

// export const getOneHabit = async (
//     req: AuthenticatedRequest,
//     res: Response
// ) => {
//     try {
//         const id = req.params.id
//         const result = await db.query.habits.findFirst(({
//             where: eq(habits.id, id)
//         }))

//         res.status(200).json({
//             habit: result
//         })
//     } catch (e) {
//         console.error('Fetch Habit error', e)
//         res.status(500).json({ error: 'Failed to fetch habit' })
//     }
// }

export const getHabitById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params
        const userId = req.user!.id // token

        const habit = await db.query.habits.findFirst({
            where: and(eq(habits.id, id), eq(habits.userId, userId)), // based on authentication
            with: {
                habitTags: {
                    with: {
                        tag: true,
                    },
                },
                entries: {
                    orderBy: [desc(entries.completionDate)],
                    limit: 10, // Recent entries only
                },
            },
        })

        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' })
        }

        // Transform the data
        const habitWithTags = {
            ...habit,
            tags: habit.habitTags.map((ht) => ht.tag),
            habitTags: undefined,
        }

        res.json({
            habit: habitWithTags,
        })
    } catch (error) {
        console.error('Get habit error:', error)
        res.status(500).json({ error: 'Failed to fetch habit' })
    }
}

export const deleteHabit = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params
        const userId = req!.user.id

        const [deleteHabit] = await db.delete(habits)
            .where(and(eq(habits.id, id), eq(habits.userId, userId)))
            .returning() //.returning() always returns an array. so we're destructing, extracting first element


        if (!deleteHabit) {
            res.status(403).json({ message: 'Response not found' })
        }

        res.status(200).json({
            habit: deleteHabit
        })
    } catch (e) {
        console.error('Delete habit error:', e)
        res.status(500).json({ error: 'Failed to delete habit' })
    }
}

// delete/update need .returning() if you want the deleted/updated record.
// GET queries don’t use .returning() because they use .findFirst() / .findMany()