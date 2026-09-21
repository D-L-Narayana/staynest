import { describe, it, expect } from "vitest";
import {
  CLEANING_FEE,
  computeBreakdown,
  nightsBetween,
  parseISODate,
  rangesOverlap,
  toISODate,
  validateStay,
  formatMoney,
} from "@/lib/pricing";

describe("computeBreakdown", () => {
  it("adds nightly total, cleaning and a 12% service fee", () => {
    const b = computeBreakdown(540, 5);
    expect(b).toEqual({
      perNight: 540,
      nights: 5,
      nightly: 2700,
      cleaning: 60,
      serviceFee: 324,
      total: 3084,
    });
  });
  it("rounds the service fee to whole dollars", () => {
    expect(computeBreakdown(333, 1).serviceFee).toBe(40); // 39.96 → 40
  });
  it("charges no cleaning fee for zero nights", () => {
    expect(computeBreakdown(200, 0)).toMatchObject({
      nightly: 0,
      cleaning: 0,
      serviceFee: 0,
      total: 0,
    });
    expect(CLEANING_FEE).toBe(60);
  });
  it("ignores fractional nights", () => {
    expect(computeBreakdown(100, 2.9).nights).toBe(2);
  });
});

describe("dates", () => {
  it("parses only strict ISO dates", () => {
    expect(parseISODate("2026-10-05")?.getDate()).toBe(5);
    expect(parseISODate("2026-13-40")).toBeNull();
    expect(parseISODate("10/05/2026")).toBeNull();
    expect(parseISODate("")).toBeNull();
  });
  it("round-trips through toISODate", () => {
    expect(toISODate(parseISODate("2026-02-28")!)).toBe("2026-02-28");
  });
  it("counts whole nights and never goes negative", () => {
    expect(nightsBetween("2026-10-01", "2026-10-06")).toBe(5);
    expect(nightsBetween("2026-10-06", "2026-10-01")).toBe(0);
    expect(nightsBetween("bad", "2026-10-01")).toBe(0);
  });
  it("treats ranges as half-open intervals (back-to-back stays do not overlap)", () => {
    const a = { checkIn: "2026-10-01", checkOut: "2026-10-05" };
    expect(rangesOverlap(a, { checkIn: "2026-10-05", checkOut: "2026-10-08" })).toBe(false);
    expect(rangesOverlap(a, { checkIn: "2026-10-04", checkOut: "2026-10-08" })).toBe(true);
    expect(rangesOverlap(a, { checkIn: "2026-09-28", checkOut: "2026-10-02" })).toBe(true);
    expect(rangesOverlap(a, { checkIn: "2026-09-01", checkOut: "2026-12-01" })).toBe(true);
  });
});

describe("validateStay", () => {
  const today = new Date(2026, 8, 21); // 21 Sep 2026
  const listing = { guests: 4 };
  it("accepts a valid future stay", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-04", guests: 2 }, listing, [], today)
    ).toEqual({ ok: true, nights: 3 });
  });
  it("rejects missing, past, reversed and too-long stays", () => {
    expect(validateStay({}, listing, [], today)).toMatchObject({
      ok: false,
      error: /Select check-in/,
    });
    expect(
      validateStay({ checkIn: "2026-09-20", checkOut: "2026-09-25" }, listing, [], today)
    ).toMatchObject({ ok: false, error: /past/ });
    expect(
      validateStay({ checkIn: "2026-09-25", checkOut: "2026-09-25" }, listing, [], today)
    ).toMatchObject({ ok: false, error: /after check-in/ });
    expect(
      validateStay({ checkIn: "2026-09-25", checkOut: "2027-01-25" }, listing, [], today)
    ).toMatchObject({ ok: false, error: /90 nights/ });
  });
  it("allows check-in today", () => {
    expect(
      validateStay({ checkIn: "2026-09-21", checkOut: "2026-09-22" }, listing, [], today)
    ).toEqual({ ok: true, nights: 1 });
  });
  it("enforces guest capacity", () => {
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-02", guests: 5 }, listing, [], today)
    ).toMatchObject({ ok: false, error: /up to 4 guests/ });
  });
  it("refuses dates that overlap an existing booking", () => {
    const booked = [{ checkIn: "2026-10-03", checkOut: "2026-10-06" }];
    expect(
      validateStay({ checkIn: "2026-10-01", checkOut: "2026-10-04" }, listing, booked, today)
    ).toMatchObject({ ok: false, error: /no longer available/ });
    expect(
      validateStay({ checkIn: "2026-10-06", checkOut: "2026-10-09" }, listing, booked, today)
    ).toEqual({ ok: true, nights: 3 });
  });
});

describe("formatMoney", () => {
  it("formats whole dollars", () => {
    expect(formatMoney(3084)).toBe("$3,084");
  });
});
