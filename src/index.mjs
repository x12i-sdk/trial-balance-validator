import assert from 'node:assert/strict';
import { validateTrialBalance } from '@x12i/trial-balance-validator';
const period = { start: '2026-01-01', endExclusive: '2027-01-01' };
const records = [
  { id: 'cash', opening: '100.00', debit: '25.00', credit: '0.00', closing: '125.00' },
  { id: 'capital', opening: '-100.00', debit: '0.00', credit: '25.00', closing: '-125.00' },
].map(item => ({
  recordId: item.id, contributionId: 'input-' + item.id,
  accountKey: { entityId: 'demo', ledgerId: 'general', chartId: 'demo-chart', accountId: item.id },
  label: item.id, bookCurrency: 'USD', period,
  opening: { amount: item.opening, asOf: period.start, state: 'known' },
  activity: { debitColumn: item.debit, creditColumn: item.credit, semantics: 'net_columns', closingEntries: 'excluded' },
  closing: { amount: item.closing, asOfExclusive: period.endExclusive, state: 'known' },
  specialEvents: [], dimensions: [], provenance: [{ sourceId: 'synthetic', revision: '1', locator: { row: item.id } }],
}));
const dataset = {
  schemaVersion: '1.0', datasetId: 'synthetic-year', datasetRevision: '1', entityId: 'demo', ledgerId: 'general',
  sourceId: 'synthetic', sourceRevision: '1', sourceContentHash: 'synthetic-content-v1', datasetType: 'trial_balance',
  producer: { name: 'usage-example', version: '1.0.0' }, extractedAt: '2026-01-01T00:00:00.000Z',
  capabilities: ['trial_balance'], completeness: { scope: 'ledger', claim: 'complete', population: 'two synthetic accounts', guaranteesMissingAsZero: true },
  representation: 'period_activity', basis: 'source_as_reported', records,
};
const result = validateTrialBalance({ schemaVersion: '1.0', datasets: [dataset] });
assert.equal(result.data.coverage.outputUniqueAccounts, 2);
assert.equal(result.data.invariants.recordCount, 2);
assert.equal(result.findings.filter(item => item.severity === 'error' || item.severity === 'critical').length, 0);
console.log({ coverage: result.data.coverage, findings: result.findings });
