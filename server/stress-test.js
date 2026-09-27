require('dotenv').config();
const autocannon = require('autocannon');
const http = require('http');
const app = require('./src/app');
const { initDb, pool } = require('./src/db');

const TEST_PORT = 5051;
let server;

async function runAutocannon(title, url, connections, duration = 10, headers = {}) {
  console.log(`\n========================================`);
  console.log(`Running: ${title}`);
  console.log(`URL: ${url}`);
  console.log(`Connections: ${connections} | Duration: ${duration}s`);
  console.log(`========================================`);

  const result = await autocannon({
    url,
    connections,
    duration,
    headers,
    pipelining: 1
  });

  console.log(`-> Requests/sec (avg): ${result.requests.average}`);
  console.log(`-> Latency (avg):      ${result.latency.average} ms`);
  console.log(`-> Latency (p99):      ${result.latency.p99} ms`);
  console.log(`-> 2xx responses:      ${result['2xx']}`);
  console.log(`-> Non-2xx / Errors:   ${result.non2xx + result.errors}`);

  return {
    title,
    connections,
    reqPerSec: Math.round(result.requests.average),
    latencyAvg: result.latency.average.toFixed(2),
    latencyP99: result.latency.p99.toFixed(2),
    success: result['2xx'],
    errors: result.non2xx + result.errors
  };
}

async function main() {
  await initDb();
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Stress test server listening on port ${TEST_PORT}`);

  // Warm-up query
  try {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/releases`);
    await res.json();
  } catch (err) {
    console.error('Warm-up error:', err.message);
  }

  const results = [];

  // Scenario 1: Baseline (Unoptimized direct remote DB hit on every request)
  console.log('\n>>> SCENARIO 1: BASELINE (Direct Remote Neon PostgreSQL Hits, No Caching) <<<');
  results.push(
    await runAutocannon(
      'Baseline 25 Concurrent Users (No Cache)',
      `http://localhost:${TEST_PORT}/api/releases?noCache=1`,
      25,
      6
    )
  );

  results.push(
    await runAutocannon(
      'Baseline 50 Concurrent Users (Connection Pool Saturation)',
      `http://localhost:${TEST_PORT}/api/releases?noCache=1`,
      50,
      6
    )
  );

  // Scenario 2: Optimized (In-Memory Response Caching + HTTP Compression + Pool Reuse)
  console.log('\n>>> SCENARIO 2: OPTIMIZED (In-Memory Cached Reads + Connection Pooling) <<<');
  results.push(
    await runAutocannon(
      'Optimized 50 Concurrent Users',
      `http://localhost:${TEST_PORT}/api/releases`,
      50,
      6
    )
  );

  results.push(
    await runAutocannon(
      'Optimized 100 Concurrent Users',
      `http://localhost:${TEST_PORT}/api/releases`,
      100,
      6
    )
  );

  results.push(
    await runAutocannon(
      'Optimized 250 Concurrent Users',
      `http://localhost:${TEST_PORT}/api/releases`,
      250,
      6
    )
  );

  results.push(
    await runAutocannon(
      'Optimized 500 Concurrent Users',
      `http://localhost:${TEST_PORT}/api/releases`,
      500,
      6
    )
  );

  // Summary Table
  console.log('\n\n========================================================================================');
  console.log('STRESS TEST BENCHMARK RESULTS SUMMARY');
  console.log('========================================================================================');
  console.table(results);

  server.close();
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal stress test failure:', err);
  if (server) server.close();
  process.exit(1);
});
