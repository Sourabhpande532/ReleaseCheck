const DEFAULT_STEPS = [
  { id: 'pr_merged', label: 'All relevant Github pull requests have been merged' },
  { id: 'changelog_updated', label: 'CHANGELOG.md files have been updated' },
  { id: 'tests_passing', label: 'All tests are passing' },
  { id: 'github_release_created', label: 'Releases in Github created' },
  { id: 'deployed_demo', label: 'Deployed in demo' },
  { id: 'tested_demo', label: 'Tested thoroughly in demo' },
  { id: 'deployed_production', label: 'Deployed in production' }
];

/**
 * Computes release status based on completed steps.
 * Rule from specs:
 * - No step completed: planned
 * - At least one step completed (but not all): ongoing
 * - All steps completed: done
 * 
 * @param {Array<string>} completedStepsArray 
 * @param {number} totalStepsCount 
 * @returns {'planned' | 'ongoing' | 'done'}
 */
function computeStatus(completedStepsArray = [], totalStepsCount = DEFAULT_STEPS.length) {
  const count = Array.isArray(completedStepsArray) ? completedStepsArray.length : 0;
  if (count === 0) {
    return 'planned';
  }
  if (count >= totalStepsCount) {
    return 'done';
  }
  return 'ongoing';
}

module.exports = {
  DEFAULT_STEPS,
  computeStatus
};
