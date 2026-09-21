import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { WishlistProvider, useWishlist, getDeviceId } from "@/lib/wishlist";

vi.mock("@/lib/toast", () => ({ toast: vi.fn() }));

function Probe() {
  const { ids, ready, toggle } = useWishlist();
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="ids">{ids.join(",")}</span>
      <button onClick={() => toggle("villa-amalfi")}>toggle</button>
    </div>
  );
}

type Deferred = { resolve: (v: Response) => void; promise: Promise<Response> };
function deferred(): Deferred {
  let resolve!: (v: Response) => void;
  const promise = new Promise<Response>((r) => (resolve = r));
  return { resolve, promise };
}
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

describe("WishlistProvider", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("creates a stable per-browser device id", () => {
    const a = getDeviceId();
    expect(a.startsWith("dev-")).toBe(true);
    expect(getDeviceId()).toBe(a);
  });

  it("hydrates from the API and toggles optimistically", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init) return json({ ids: ["loft-tokyo"] });
      return json({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <WishlistProvider>
        <Probe />
      </WishlistProvider>
    );
    await screen.findByText("true");
    expect(screen.getByTestId("ids").textContent).toBe("loft-tokyo");

    await act(async () => screen.getByText("toggle").click());
    expect(screen.getByTestId("ids").textContent).toBe("loft-tokyo,villa-amalfi");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/wishlist",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("does not let a slow initial fetch wipe out a heart tapped before it returned", async () => {
    const initialGet = deferred();
    const fetchMock = vi.fn((_url: string, init?: RequestInit) =>
      init ? Promise.resolve(json({ ok: true })) : initialGet.promise
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <WishlistProvider>
        <Probe />
      </WishlistProvider>
    );
    // User taps the heart while the GET is still in flight.
    await act(async () => screen.getByText("toggle").click());
    expect(screen.getByTestId("ids").textContent).toBe("villa-amalfi");

    // The stale GET (started before the POST settled) finally returns an empty list.
    await act(async () => {
      initialGet.resolve(json({ ids: [] }));
      await initialGet.promise;
    });
    expect(screen.getByTestId("ready").textContent).toBe("true");
    expect(screen.getByTestId("ids").textContent).toBe("villa-amalfi");
  });

  it("reverts the optimistic change when the API call fails", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) =>
      init ? new Response("nope", { status: 500 }) : json({ ids: [] })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(
      <WishlistProvider>
        <Probe />
      </WishlistProvider>
    );
    await screen.findByText("true");
    await act(async () => screen.getByText("toggle").click());
    expect(screen.getByTestId("ids").textContent).toBe("");
  });
});
