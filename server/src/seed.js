require('dotenv').config();
const { pool, initDb, query } = require('./db');
const { DEFAULT_STEPS, computeStatus } = require('./constants');

const sampleReleases = [
  {
    name: 'Version 1.0.1',
    release_date: '2022-09-20',
    additional_info: 'Initial production release with foundational checklist items.',
    steps_completed: DEFAULT_STEPS.map((s) => s.id) // All 7 steps completed -> Done
  },
  {
    name: 'Version 1.0.2',
    release_date: '2022-09-28',
    additional_info: 'Hotfix release addressing minor UI alignment and telemetry logging.',
    steps_completed: DEFAULT_STEPS.map((s) => s.id) // All 7 steps completed -> Done
  },
  {
    name: 'Version 1.1.0',
    release_date: '2022-10-10',
    additional_info: 'Feature release with batch updates and enhanced workflow automation.',
    steps_completed: ['pr_merged', 'changelog_updated', 'tests_passing', 'github_release_created'] // 4 steps -> Ongoing
  },
  {
    name: 'Version 2 (beta)',
    release_date: '2022-11-01',
    additional_info: 'Next-generation architecture with distributed state management.',
    steps_completed: [] // 0 steps -> Planned
  }
];

const seed = async () => {
  try {
    await initDb();
    console.log('Seeding demo releases matching mockup...');

    for (const r of sampleReleases) {
      // Check if already exists to prevent duplicate spamming
      const existing = await query('SELECT id FROM releases WHERE name = $1', [r.name]);
      const status = computeStatus(r.steps_completed);

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO releases (name, release_date, status, additional_info, steps_completed)
           VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [r.name, r.release_date, status, r.additional_info, JSON.stringify(r.steps_completed)]
        );
        console.log(`Inserted: ${r.name} (${status})`);
      } else {
        console.log(`Already exists: ${r.name}`);
      }
    }

    console.log('Seeding completed successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
};

seed();
