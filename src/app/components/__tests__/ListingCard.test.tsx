import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListingCard from "@/app/components/ListingCard";
import { LISTINGS } from "@/lib/listings";

const listing = LISTINGS[0];

describe("<ListingCard />", () => {
  it("renders title, location, price and rating", () => {
    render(<ListingCard listing={listing} />);
    expect(screen.getByText(listing.title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(listing.location))).toBeInTheDocument();
    expect(screen.getByText(`$${listing.price}`)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: listing.title })).toHaveAttribute(
      "src",
      listing.images[0]
    );
  });

  it("links to the listing detail page", () => {
    render(<ListingCard listing={listing} />);
    const links = screen.getAllByRole("link");
    expect(links.some((a) => a.getAttribute("href") === `/listing/${listing.id}`)).toBe(true);
  });

  it("toggles the wishlist without navigating and reflects the liked state", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(<ListingCard listing={listing} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Save to wishlist" }));
    expect(onToggle).toHaveBeenCalledWith(listing.id);
    rerender(<ListingCard listing={listing} liked onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Remove from wishlist" })).toBeInTheDocument();
  });

  it("cycles through photos with the next/previous controls", async () => {
    render(<ListingCard listing={listing} />);
    const img = screen.getByRole("img", { name: listing.title });
    await userEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(img).toHaveAttribute("src", listing.images[1]);
    await userEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(img).toHaveAttribute("src", listing.images[0]);
  });
});
