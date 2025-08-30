import express from 'express'
import cors from 'cors'

import servicesRouter from './routes/services'
import staffRouter from './routes/staff'
import scheduleRouter from './routes/schedule'
import timeoffRouter from './routes/timeoff'
import bookingsRouter from './routes/bookings'
import customersRouter from './routes/customers'
import settingsRouter from './routes/settings'
import publicRouter from './routes/public'
import mediaRouter from './routes/media'
import notificationsRouter from './routes/notifications'
import advancedBookingsRouter from './routes/advanced-bookings'

const app = express()
app.use(cors())
app.use(express.json())

// Tenant (DEV: fixer Tenant - für Dev immer t_dev setzen)
app.use((req, _res, next) => { 
  // In DEV-Mode immer t_dev setzen
  req.tenantId = 't_dev'
  // Add tenant ID to headers for new routes
  req.headers['x-tenant-id'] = 't_dev'
  next() 
})

// Dev-Auth via Header
app.use((req, _res, next) => {
  const role = req.header('x-user-role')
  const email = req.header('x-user-email')
  if (role && email) req.user = { role, email }
  next()
})

// Health (ohne DB-Abhängigkeiten für Tests)
app.get('/api/ping', (_req, res) => res.json({ ok: true }))

// Routers
app.use('/api/media', mediaRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/bookings', advancedBookingsRouter)
app.use(servicesRouter)
app.use(staffRouter)
app.use(scheduleRouter)
app.use(timeoffRouter)
app.use(bookingsRouter)
app.use(customersRouter)
app.use(settingsRouter)
app.use(publicRouter)

export default app
