# Delay duration popover

Double-click only Delay nodes to open a local draft editor with a number and S/M/H unit. Unit changes keep the entered number; preview reflects the selected unit. Apply writes duration in milliseconds and durationUnit in one updateNodeData call, using existing permissions and undo/redo. Cancel, Escape or outside click discards the draft. The node shows compact s/m/h text and has no title or Edit button.

Legacy nodes without durationUnit use seconds. Values must be positive, at least 1ms after rounding, and within the browser timeout limit to avoid immediate execution from timer overflow. Existing execution code and backend node serialization retain their millisecond contract. Metadata is preserved through the existing node-data save path for both backends; live database writes were not performed.

Files: DelayNode.jsx, utils/delayDuration.ts, scripts/delay-duration.test.mjs, page documentation and HISTORY.md.

Validation: five conversion/validation tests passed (Node 24 strip-types); browser interaction was not verified in this session. Lint/build results are recorded in HISTORY.md.
