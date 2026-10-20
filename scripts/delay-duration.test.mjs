import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDelayUnit,
  parseDelayDuration,
  formatDelayDuration,
} from "../app/(siderbar-header)/admin/builder/utils/delayDuration.ts";

test("decimal minutes and hours retain millisecond execution values", () => {
  assert.equal(parseDelayDuration("1.5", "M").duration, 90000);
  assert.equal(parseDelayDuration("0.25", "H").duration, 900000);
});

test("changing units keeps the entered number and changes the duration", () => {
  assert.equal(parseDelayDuration("5", "S").duration, 5000);
  assert.equal(parseDelayDuration("5", "M").duration, 300000);
});

test("legacy delays use seconds and preserve subsecond precision", () => {
  assert.equal(getDelayUnit(undefined), "S");
  assert.equal(formatDelayDuration(150, getDelayUnit(undefined)), "0.15s");
  assert.equal(formatDelayDuration(90000, "M"), "1.5m");
  assert.equal(formatDelayDuration(3600000, "H"), "1h");
});

test("empty, zero, negative and nonfinite values cannot be saved", () => {
  for (const value of ["", " ", "0", "-1", "NaN", "Infinity", "abc"]) {
    assert.equal(parseDelayDuration(value, "S").duration, null);
  }
});

test("reject durations that would underflow or overflow browser timers", () => {
  assert.equal(parseDelayDuration("0.0001", "S").error, "minimum");
  assert.equal(parseDelayDuration("1000", "H").error, "maximum");
  assert.equal(parseDelayDuration("0.001", "S").duration, 1);
});

test("values are limited to four integer digits while decimals remain supported", () => {
  assert.equal(parseDelayDuration("9999", "S").duration, 9999000);
  assert.equal(parseDelayDuration("9998.5", "S").duration, 9998500);
  assert.equal(parseDelayDuration("10000", "S").error, "digits");
});
