import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main(){
  const t = await db.tenant.upsert({
    where:{ id:'t_dev' }, update:{},
    create:{ id:'t_dev', name:'Dev Salon', domain:'localhost', plan:'free', theme:null }
  })
  await db.profile.upsert({
    where:{ tenantId_email:{ tenantId:t.id, email:'admin@dev.local' } },
    update:{},
    create:{ tenantId:t.id, email:'admin@dev.local', role:'owner', fullName:'Dev Admin' }
  })

  // Sample Services
  const service1 = await db.service.upsert({
    where: { tenantId_name: { tenantId: t.id, name: 'Haircut' } },
    update: {},
    create: { tenantId: t.id, name: 'Haircut', durationMin: 60, priceCents: 5000, active: true }
  })

  const service2 = await db.service.upsert({
    where: { tenantId_name: { tenantId: t.id, name: 'Styling' } },
    update: {},
    create: { tenantId: t.id, name: 'Styling', durationMin: 45, priceCents: 4000, active: true }
  })

  // Sample Staff - use findFirst and create if not exists
  let staff1 = await db.staff.findFirst({
    where: { tenantId: t.id, name: 'Alex Weber' }
  })
  if (!staff1) {
    staff1 = await db.staff.create({
      data: { tenantId: t.id, name: 'Alex Weber', active: true, imageUrl: null }
    })
  }

  let staff2 = await db.staff.findFirst({
    where: { tenantId: t.id, name: 'Sarah Mueller' }
  })
  if (!staff2) {
    staff2 = await db.staff.create({
      data: { tenantId: t.id, name: 'Sarah Mueller', active: true, imageUrl: null }
    })
  }

  // Sample Schedules - use unique constraint from schema
  // Alex: Monday-Friday 9:00-17:00 (540-1020 minutes)
  await db.schedule.upsert({
    where: { staffId_weekday_startMin_endMin: { staffId: staff1.id, weekday: 1, startMin: 540, endMin: 1020 } },
    update: {},
    create: { tenantId: t.id, staffId: staff1.id, weekday: 1, startMin: 540, endMin: 1020 }
  })
  await db.schedule.upsert({
    where: { staffId_weekday_startMin_endMin: { staffId: staff1.id, weekday: 2, startMin: 540, endMin: 1020 } },
    update: {},
    create: { tenantId: t.id, staffId: staff1.id, weekday: 2, startMin: 540, endMin: 1020 }
  })
  await db.schedule.upsert({
    where: { staffId_weekday_startMin_endMin: { staffId: staff1.id, weekday: 3, startMin: 540, endMin: 1020 } },
    update: {},
    create: { tenantId: t.id, staffId: staff1.id, weekday: 3, startMin: 540, endMin: 1020 }
  })

  // Sarah: Tuesday-Saturday 10:00-18:00 (600-1080 minutes)
  await db.schedule.upsert({
    where: { staffId_weekday_startMin_endMin: { staffId: staff2.id, weekday: 2, startMin: 600, endMin: 1080 } },
    update: {},
    create: { tenantId: t.id, staffId: staff2.id, weekday: 2, startMin: 600, endMin: 1080 }
  })
  await db.schedule.upsert({
    where: { staffId_weekday_startMin_endMin: { staffId: staff2.id, weekday: 6, startMin: 600, endMin: 1080 } },
    update: {},
    create: { tenantId: t.id, staffId: staff2.id, weekday: 6, startMin: 600, endMin: 1080 }
  })

  // Sample TimeOff
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekEnd = new Date(nextWeek)
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2)

  const existingTimeOff = await db.timeOff.findFirst({
    where: { staffId: staff1.id, dateFrom: nextWeek }
  })
  if (!existingTimeOff) {
    await db.timeOff.create({ 
      data: {
        tenantId: t.id, 
        staffId: staff1.id, 
        dateFrom: nextWeek, 
        dateTo: nextWeekEnd, 
        reason: 'Vacation' 
      }
    })
  }

  console.log('Seed OK with staff, schedules, and timeoff')
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)})
