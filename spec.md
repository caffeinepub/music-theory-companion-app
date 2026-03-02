# Specification

## Summary
**Goal:** Fix the TheoryPanel so that chord charts and scales correctly display when a key is set manually via KeySelector or locked in via AudioAnalyzer.

**Planned changes:**
- Audit and fix state/prop flow between MusicTheoryApp, KeySelector, AudioAnalyzer, and TheoryPanel so the active key is consistently passed to TheoryPanel.
- Ensure TheoryPanel's data-fetching hooks receive the correct key argument and re-fetch whenever the key changes (manual or auto-locked).
- Fix any issues (incorrect prop passing, stale state, missing re-renders, query key mismatches) that cause TheoryPanel to remain empty after a key is selected or locked in.

**User-visible outcome:** After selecting a key manually or having it auto-detected and locked in, the TheoryPanel immediately shows the correct chord progressions and scales for that key without remaining empty or stuck in a loading state.
