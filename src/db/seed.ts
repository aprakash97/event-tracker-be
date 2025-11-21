import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

const seed = async () => {
    console.log('🌱 starting database seed...!')

    try {
        console.log('Clearing existing data...')
        await db.delete(entries)
        await db.delete(habits)
        await db.delete(habitTags)
        await db.delete(tags)
        await db.delete(users)

        console.log('Creating demo users...')
        const [demoUser] = await db.insert(users).values({
            email: 'acent@gmail.com',
            password: 'pop123',
            username: 'acentD',
            firstName: 'acent',
            lastName: 'demo'
        }).returning()

        console.log('Creating Tags..')
        const [healthTag] = await db.insert(tags).values({
            name: 'learning',
            color: '#B00'
        }).returning()

        const [exerciseHabit] = await db.insert(habits).values({
            userId: demoUser.id,
            name: 'Exercise',
            description: 'Daily workout',
            frequency: 'daily',
            targetCount: 1
        }).returning()

        await db.insert(habitTags).values({
            habitId: exerciseHabit.id,
            tagId: healthTag.id
        }).returning()

        console.log('Adding completion entries...')

        const today = new Date()
        today.setHours(12, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - 1)
            await db.insert(entries).values({
                habitId: exerciseHabit.id,
                completionDate: date,
            })
        }

        console.log('✅ DB seeded successfully')
        console.log('user credentials:')
        console.log(`email: ${demoUser.username}`)
        console.log(`email: ${demoUser.email}`)
    } catch (e) {
        console.error('❌ seed failed', e)
        process.exit(1)
    }
}

seed() // won't restrict this being called in a another file, we should run this file via only terminal script

export default seed