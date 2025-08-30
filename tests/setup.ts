import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'

const db = new PrismaClient()

// Clean up database once before all tests start
beforeAll(async () => {
  // Delete in reverse order of dependencies to avoid FK constraint violations
  await db.booking.deleteMany({})
  await db.schedule.deleteMany({})
  await db.timeOff.deleteMany({})
  await db.staffService.deleteMany({})
  await db.staff.deleteMany({})
  await db.service.deleteMany({})
  await db.customerBan.deleteMany({})
  await db.waitingList.deleteMany({})
})

// Optional: Additional cleanup after all tests
afterAll(async () => {
  // Final cleanup if needed
})

// Cleanup on exit
process.on('beforeExit', async () => {
  await db.$disconnect()
})
