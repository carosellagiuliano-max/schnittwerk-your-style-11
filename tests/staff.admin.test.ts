import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/server/app';
import { db } from '../src/server/lib/db';

const ADMIN_HEADERS = {
  'x-user-role': 'admin',
  'x-user-email': 'admin@dev.local'
};

describe('Staff API', () => {
  beforeEach(async () => {
    // Clean up test data
    await db.staffService.deleteMany({});
    await db.schedule.deleteMany({});
    await db.timeOff.deleteMany({});
    await db.staff.deleteMany({});
  });

  describe('GET /api/admin/staff', () => {
    it('should return empty staff list initially', async () => {
      const response = await request(app)
        .get('/api/admin/staff')
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return staff list after creation', async () => {
      // Create a staff member first
      await request(app)
        .post('/api/admin/staff')
        .set(ADMIN_HEADERS)
        .send({ name: 'Test Staff' });

      const response = await request(app)
        .get('/api/admin/staff')
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Test Staff');
      expect(response.body[0].active).toBe(true);
    });
  });

  describe('POST /api/admin/staff', () => {
    it('should create a new staff member', async () => {
      const response = await request(app)
        .post('/api/admin/staff')
        .set(ADMIN_HEADERS)
        .send({ name: 'John Doe' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('John Doe');
      expect(response.body.active).toBe(true);
      expect(response.body.id).toBeDefined();
    });

    it('should require name field', async () => {
      const response = await request(app)
        .post('/api/admin/staff')
        .set(ADMIN_HEADERS)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('name');
    });
  });

  describe('PUT /api/admin/staff/:id', () => {
    it('should update staff member', async () => {
      // Create staff first
      const createResponse = await request(app)
        .post('/api/admin/staff')
        .set(ADMIN_HEADERS)
        .send({ name: 'Original Name' });

      const staffId = createResponse.body.id;

      // Update staff
      const response = await request(app)
        .put(`/api/admin/staff/${staffId}`)
        .set(ADMIN_HEADERS)
        .send({ name: 'Updated Name', active: false });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.active).toBe(false);
    });

    it('should return 404 for non-existent staff', async () => {
      const response = await request(app)
        .put('/api/admin/staff/non-existent')
        .set(ADMIN_HEADERS)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/staff/:id', () => {
    it('should delete staff member', async () => {
      // Create staff first
      const createResponse = await request(app)
        .post('/api/admin/staff')
        .set(ADMIN_HEADERS)
        .send({ name: 'To Be Deleted' });

      const staffId = createResponse.body.id;

      // Delete staff
      const response = await request(app)
        .delete(`/api/admin/staff/${staffId}`)
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(204);

      // Verify deletion
      const listResponse = await request(app)
        .get('/api/admin/staff')
        .set(ADMIN_HEADERS);

      expect(listResponse.body).toHaveLength(0);
    });

    it('should return 404 for non-existent staff', async () => {
      const response = await request(app)
        .delete('/api/admin/staff/non-existent')
        .set(ADMIN_HEADERS);

      expect(response.status).toBe(404);
    });
  });
});
