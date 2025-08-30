import request from 'supertest'
import app from '../app'
import { describe, it, expect } from 'vitest'

describe('API Ping', () => {
  it('returns ok:true', async () => {
    const res = await request(app).get('/api/ping')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ok', true)
    expect(res.body).toHaveProperty('timestamp')
    expect(res.body).toHaveProperty('version')
  })
})
