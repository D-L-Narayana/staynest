import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { createLocalStore, useHydrated } from "@/lib/storage";

describe("createLocalStore", () => {
  it("returns the fallback when nothing is stored or JSON is corrupt", () => {
    const store = createLocalStore<string[]>("t.fallback", ["x"]);
    expect(store.read()).toEqual(["x"]);
    window.localStorage.setItem("t.fallback", "{not json");
    expect(store.read()).toEqual(["x"]);
  });
  it("persists writes and notifies subscribed hooks", () => {
    const store = createLocalStore<number>("t.counter", 0);
    const { result } = renderHook(() => store.useValue());
    expect(result.current).toBe(0);
    act(() => {
      store.write((n) => n + 5);
    });
    expect(result.current).toBe(5);
    expect(JSON.parse(window.localStorage.getItem("t.counter")!)).toBe(5);
  });
  it("shares one value between independent consumers", () => {
    const store = createLocalStore<string>("t.shared", "");
    const a = renderHook(() => store.useValue());
    const b = renderHook(() => store.useValue());
    act(() => {
      store.write("hello");
    });
    expect(a.result.current).toBe("hello");
    expect(b.result.current).toBe("hello");
  });
  it("returns a stable reference while the stored value is unchanged", () => {
    const store = createLocalStore<{ a: number }>("t.stable", { a: 1 });
    store.write({ a: 2 });
    expect(store.read()).toBe(store.read());
  });
  it("reacts to storage events from other tabs", () => {
    const store = createLocalStore<string>("t.tabs", "");
    const { result } = renderHook(() => store.useValue());
    act(() => {
      window.localStorage.setItem("t.tabs", JSON.stringify("from-other-tab"));
      window.dispatchEvent(new StorageEvent("storage", { key: "t.tabs" }));
    });
    expect(result.current).toBe("from-other-tab");
  });
});

describe("useHydrated", () => {
  it("is true after mount on the client", () => {
    const { result } = renderHook(() => useHydrated());
    expect(result.current).toBe(true);
  });
});
