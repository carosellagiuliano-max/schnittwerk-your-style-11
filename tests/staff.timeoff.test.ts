import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server/app';
import { db } from '../src/server/lib/db';

const ADMIN_HEADERS = {
  'x-user-role': 'admin',
  'x-user-email': 'admin@dev.local'
};

describe('TimeOff API', () => {
  let staffId: string;

  beforeEach(async () => {
    // Clean up test data
    await db.timeOff.deleteMany({});
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

  describe('GET /api/admin/staff/:staffId/timeoff', () => {
    it('should return empty timeoff list initially', async () => {
      const response = await request(app)
        .get(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /api/admin/staff/:staffId/timeoff', () => {
    it('should create a new timeoff', async () => {
      const dateFrom = '2025-09-01T00:00:00Z';
      const dateTo = '2025-09-03T23:59:59Z';
      
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom,
          dateTo,
          reason: 'Vacation'
        });

      expect(response.status).toBe(201);
      expect(response.body.staffId).toBe(staffId);
      expect(response.body.reason).toBe('Vacation');
      expect(new Date(response.body.dateFrom)).toEqual(new Date(dateFrom));
      expect(new Date(response.body.dateTo)).toEqual(new Date(dateTo));
    });

    it('should validate dateFrom <= dateTo', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-05T00:00:00Z',
          dateTo: '2025-09-01T00:00:00Z', // before dateFrom - invalid!
          reason: 'Test'
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('dateFrom must be <= dateTo');
    });

    it('should require dateFrom and dateTo', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          reason: 'Test'
          // missing dateFrom, dateTo
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('dateFrom and dateTo required');
    });

    it('should allow empty reason', async () => {
      const response = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-01T00:00:00Z',
          dateTo: '2025-09-03T23:59:59Z'
          // no reason
        });

      expect(response.status).toBe(201);
      expect(response.body.reason).toBe('');
    });
  });

  describe('PUT /api/admin/staff/:staffId/timeoff/:id', () => {
    it('should update timeoff', async () => {
      // Create timeoff first
      const createResponse = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-01T00:00:00Z',
          dateTo: '2025-09-03T23:59:59Z',
          reason: 'Original reason'
        });

      const timeOffId = createResponse.body.id;

      // Update timeoff
      const response = await request(app)
        .put(`/api/admin/staff/${staffId}/timeoff/${timeOffId}`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-05T00:00:00Z',
          dateTo: '2025-09-07T23:59:59Z',
          reason: 'Updated reason'
        });

      expect(response.status).toBe(200);
      expect(response.body.reason).toBe('Updated reason');
      expect(new Date(response.body.dateFrom)).toEqual(new Date('2025-09-05T00:00:00Z'));
      expect(new Date(response.body.dateTo)).toEqual(new Date('2025-09-07T23:59:59Z'));
    });

    it('should return 404 for non-existent timeoff', async () => {
      const response = await request(app)
        .put(`/api/admin/staff/${staffId}/timeoff/non-existent`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-01T00:00:00Z',
          dateTo: '2025-09-03T23:59:59Z',
          reason: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/staff/:staffId/timeoff/:id', () => {
    it('should delete timeoff', async () => {
      // Create timeoff first
      const createResponse = await request(app)
        .post(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS)
        .send({
          dateFrom: '2025-09-01T00:00:00Z',
          dateTo: '2025-09-03T23:59:59Z',
          reason: 'To be deleted'
        });

      const timeOffId = createResponse.body.id;

      // Delete timeoff
      const response = await request(app)
        .delete(`/api/admin/staff/${staffId}/timeoff/${timeOffId}`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(204);

      // Verify deletion
      const listResponse = await request(app)
        .get(`/api/admin/staff/${staffId}/timeoff`)
        .set(ADMIN_HEADERS);

      expect(listResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent timeoff', async () => {
      const response = await request(app)
        .delete(`/api/admin/staff/${staffId}/timeoff/non-existent`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(404);
    });
  });
});
