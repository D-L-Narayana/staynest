import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingWidget, { nextAvailable } from "@/app/components/BookingWidget";
import { AuthProvider } from "@/lib/auth";
import { LISTINGS } from "@/lib/listings";
import { computeBreakdown, nightsBetween, toISODate } from "@/lib/pricing";

const listing = LISTINGS[0];
const plus = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return toISODate(x);
};

function mockFetch(handlers: Record<string, (init?: RequestInit) => unknown>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const key = Object.keys(handlers).find((k) => url.includes(k));
    if (!key) return new Response(JSON.stringify({}), { status: 404 });
    const out = handlers[key](init);
    const [status, body] = Array.isArray(out) ? (out as [number, unknown]) : [200, out];
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const renderWidget = () =>
  render(
    <AuthProvider>
      <BookingWidget listing={listing} rating={4.8} reviewCount={12} />
    </AuthProvider>
  );

describe("nextAvailable", () => {
  it("skips over booked ranges", () => {
    const booked = [{ checkIn: "2026-10-01", checkOut: "2026-10-05" }];
    expect(nextAvailable("2026-10-01", 2, booked)).toBe("2026-10-05");
    expect(nextAvailable("2026-10-05", 2, booked)).toBe("2026-10-05");
  });
});

describe("<BookingWidget />", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the live rating and a price breakdown that matches the pricing rules", async () => {
    mockFetch({ "/api/availability": () => ({ booked: [] }) });
    renderWidget();
    expect(screen.getByText(/4\.80/)).toBeInTheDocument();
    expect(screen.getByText(/12 reviews/)).toBeInTheDocument();
    const nights = nightsBetween(plus(7), plus(12));
    const b = computeBreakdown(listing.price, nights);
    expect(screen.getByTestId("total")).toHaveTextContent(`$${b.total}`);
    await waitFor(() =>
      expect(screen.getByText(/All upcoming dates are open/)).toBeInTheDocument()
    );
  });

  it("blocks dates that are already booked and offers the next free date", async () => {
    mockFetch({
      "/api/availability": () => ({ booked: [{ checkIn: plus(8), checkOut: plus(10) }] }),
    });
    renderWidget();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/no longer available/));
    expect(screen.getByTestId("reserve")).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /Next free/ }));
    await waitFor(() => expect(screen.getByTestId("reserve")).toBeEnabled());
    expect((screen.getByTestId("check-in") as HTMLInputElement).value).toBe(plus(10));
  });

  it("posts the booking with the device id and stores the confirmation locally", async () => {
    const fetchMock = mockFetch({
      "/api/availability": () => ({ booked: [] }),
      "/api/book": () => ({
        confirmation: {
          code: "SN-TEST01",
          listingId: listing.id,
          listingTitle: listing.title,
          location: listing.location,
          image: listing.images[0],
          checkIn: plus(7),
          checkOut: plus(12),
          nights: 5,
          guests: 2,
          breakdown: computeBreakdown(listing.price, 5),
          bookedAt: new Date().toISOString(),
        },
      }),
    });
    renderWidget();
    await userEvent.click(screen.getByTestId("reserve"));
    await waitFor(() => expect(screen.getByText(/Booked!/)).toBeInTheDocument());
    const call = fetchMock.mock.calls.find((c) => String(c[0]).includes("/api/book"))!;
    const body = JSON.parse(String(call[1]?.body));
    expect(body).toMatchObject({ listingId: listing.id, guests: 2 });
    expect(body.deviceId).toMatch(/\S+/);
    const trips = JSON.parse(window.localStorage.getItem("staynest.trips.v1") || "[]");
    expect(trips[0].code).toBe("SN-TEST01");
  });

  it("surfaces server-side conflicts (409) and refreshes the booked ranges", async () => {
    mockFetch({
      "/api/availability": () => ({ booked: [] }),
      "/api/book": () => [
        409,
        {
          error: "Those dates are no longer available",
          booked: [{ checkIn: plus(7), checkOut: plus(12) }],
        },
      ],
    });
    renderWidget();
    await userEvent.click(screen.getByTestId("reserve"));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/no longer available/));
    expect(screen.getByTestId("reserve")).toBeDisabled();
  });
});
