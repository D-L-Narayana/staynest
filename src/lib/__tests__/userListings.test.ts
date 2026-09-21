import { describe, it, expect, beforeEach } from "vitest";
import {
  draftToListing,
  listingToDraft,
  upsertUserListing,
  getUserListing,
  removeUserListing,
  readUserListings,
  type ListingDraft,
} from "@/lib/userListings";

const draft: ListingDraft = {
  title: "Rooftop studio",
  location: "Hyderabad, India",
  country: "India",
  type: "Entire studio",
  category: "design",
  price: 85,
  guests: 2,
  bedrooms: 1,
  beds: 1,
  baths: 1,
  superhost: false,
  description: "A bright rooftop studio with a view of the Charminar.",
  image: "/listings/loft-tokyo.jpg",
  amenities: ["WiFi", "Kitchen"],
  lat: 17.3616,
  lng: 78.4747,
  hostName: "Narayana",
};

describe("user listings", () => {
  beforeEach(() => localStorage.clear());

  it("always generates ids prefixed with my- so the server can 404 everything else", () => {
    const l = draftToListing(draft);
    expect(l.id.startsWith("my-")).toBe(true);
    expect(l.title).toBe("Rooftop studio");
  });

  it("round-trips a listing through a draft", () => {
    const l = draftToListing(draft);
    const d = listingToDraft(l);
    expect(d.id).toBe(l.id);
    expect(d.title).toBe(l.title);
    expect(draftToListing(d).id).toBe(l.id);
  });

  it("upserts, reads and removes from local storage", () => {
    const created = upsertUserListing(draft);
    expect(readUserListings()).toHaveLength(1);
    expect(getUserListing(created.id)?.title).toBe("Rooftop studio");

    upsertUserListing({ ...draft, id: created.id, title: "Rooftop studio (renamed)" });
    expect(readUserListings()).toHaveLength(1);
    expect(getUserListing(created.id)?.title).toBe("Rooftop studio (renamed)");

    removeUserListing(created.id);
    expect(readUserListings()).toHaveLength(0);
  });
});
