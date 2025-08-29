import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server/app';
import { db } from '../src/server/lib/db';

const ADMIN_HEADERS = {
  'x-user-role': 'admin',
  'x-user-email': 'admin@dev.local'
};

describe('Schedule API', () => {
  let staffId: string;

  beforeEach(async () => {
    // Clean up test data
    await db.schedule.deleteMany({});
    await db.staff.deleteMany({});

    // Create a test staff member
    const staff = await db.staff.create({
      data: {
        tenantId: 't_dev',
        name: 'Test Staff',
        active: true
      }
    });
    staffId = staff.id;
  });

  describe('GET /api/admin/staff/:staffId/schedules', () => {
    it('should return empty schedule list initially', async () => {
      const response = await request(app)
        .get(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/admin/staff/:staffId/schedules', () => {
    it('should create a new schedule', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1, // Monday
          startMin: 540, // 9:00
          endMin: 1020 // 17:00
        });

      expect(response.status).toBe(201);
      expect(response.body.weekday).toBe(1);
      expect(response.body.startMin).toBe(540);
      expect(response.body.endMin).toBe(1020);
      expect(response.body.staffId).toBe(staffId);
    });

    it('should validate startMin < endMin', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 1020, // 17:00
          endMin: 540 // 9:00 - invalid!
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('startMin<endMin');
    });

    it('should detect overlapping schedules', async () => {
      // Create first schedule
      await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 540, // 9:00
          endMin: 1020 // 17:00
        });

      // Try to create overlapping schedule
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 600, // 10:00 - overlaps with existing
          endMin: 1080 // 18:00
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Overlap');
    });

    it('should allow schedules on different weekdays', async () => {
      // Create Monday schedule
      await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 540,
          endMin: 1020
        });

      // Create Tuesday schedule - should work
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 2,
          startMin: 540,
          endMin: 1020
        });

      expect(response.status).toBe(201);
    });

    it('should require all fields', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1
          // missing startMin, endMin
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Validation');
    });
  });

  describe('PUT /api/admin/staff/:staffId/schedules/:id', () => {
    it('should update schedule', async () => {
      // Create schedule first
      const createResponse = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 540,
          endMin: 1020
        });

      const scheduleId = createResponse.body.id;

      // Update schedule
      const response = await request(app)
        .put(`/api/admin/staff/${staffId}/schedules/${scheduleId}`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 2,
          startMin: 600,
          endMin: 1080
        });

      expect(response.status).toBe(200);
      expect(response.body.weekday).toBe(2);
      expect(response.body.startMin).toBe(600);
      expect(response.body.endMin).toBe(1080);
    });

    it('should return 404 for non-existent schedule', async () => {
      const response = await request(app)
        .put(`/api/admin/staff/${staffId}/schedules/non-existent`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 540,
          endMin: 1020
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/staff/:staffId/schedules/:id', () => {
    it('should delete schedule', async () => {
      // Create schedule first
      const createResponse = await request(app)
        .post(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS)
        .send({
          weekday: 1,
          startMin: 540,
          endMin: 1020
        });

      const scheduleId = createResponse.body.id;

      // Delete schedule
      const response = await request(app)
        .delete(`/api/admin/staff/${staffId}/schedules/${scheduleId}`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(204);

      // Verify deletion
      const listResponse = await request(app)
        .get(`/api/admin/staff/${staffId}/schedules`)
        .set(ADMIN_HEADERS);

      expect(listResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent schedule', async () => {
      const response = await request(app)
        .delete(`/api/admin/staff/${staffId}/schedules/non-existent`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(404);
    });
  });
});
