const request = require('supertest');
const app = require('../src/app');
const { pool, initDb } = require('../src/db');
const { computeStatus, DEFAULT_STEPS } = require('../src/constants');

beforeAll(async () => {
  await initDb();
});

afterAll(async () => {
  await pool.end();
});

describe('Release Checklist Unit & Status Tests', () => {
  test('computeStatus accurately reflects step progression', () => {
    expect(computeStatus([])).toBe('planned');
    expect(computeStatus(['pr_merged'])).toBe('ongoing');
    expect(computeStatus(['pr_merged', 'changelog_updated', 'tests_passing'])).toBe('ongoing');
    expect(
      computeStatus([
        'pr_merged',
        'changelog_updated',
        'tests_passing',
        'github_release_created',
        'deployed_demo',
        'tested_demo',
        'deployed_production'
      ])
    ).toBe('done');
  });

  test('GET /api/steps returns 7 checklist steps', async () => {
    const res = await request(app).get('/api/steps');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(7);
    expect(res.body.data[0].id).toBe('pr_merged');
  });

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Releases API Integration Flow', () => {
  let createdId = null;

  test('POST /api/releases validation rejects empty name', async () => {
    const res = await request(app)
      .post('/api/releases')
      .send({
        name: '   ',
        release_date: '2026-10-01'
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/releases creates a release with planned status when 0 steps', async () => {
    const res = await request(app)
      .post('/api/releases')
      .send({
        name: 'Version 1.0.0-test',
        release_date: '2026-10-15',
        additional_info: 'Initial test release note',
        steps_completed: []
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Version 1.0.0-test');
    expect(res.body.data.status).toBe('planned');
    createdId = res.body.data.id;
  });

  test('GET /api/releases retrieves list containing created release', async () => {
    const res = await request(app).get('/api/releases');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.find((r) => r.id === createdId);
    expect(found).toBeDefined();
    expect(found.name).toBe('Version 1.0.0-test');
  });

  test('GET /api/releases/:id retrieves single release', async () => {
    const res = await request(app).get(`/api/releases/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdId);
    expect(res.body.data.name).toBe('Version 1.0.0-test');
  });

  test('PUT /api/releases/:id updates steps and sets status to ongoing', async () => {
    const res = await request(app)
      .put(`/api/releases/${createdId}`)
      .send({
        steps_completed: ['pr_merged', 'tests_passing']
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ongoing');
    expect(res.body.data.steps_completed).toEqual(['pr_merged', 'tests_passing']);
  });

  test('PUT /api/releases/:id setting all steps updates status to done', async () => {
    const allStepIds = DEFAULT_STEPS.map((s) => s.id);
    const res = await request(app)
      .put(`/api/releases/${createdId}`)
      .send({
        steps_completed: allStepIds
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('done');
  });

  test('DELETE /api/releases/:id removes the release', async () => {
    const res = await request(app).delete(`/api/releases/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/releases/${createdId}`);
    expect(getRes.status).toBe(404);
  });
});
