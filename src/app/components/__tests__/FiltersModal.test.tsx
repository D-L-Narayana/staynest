import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltersModal, { EMPTY_FILTERS, countActive } from "@/app/components/FiltersModal";

describe("countActive", () => {
  it("counts each active filter and every amenity", () => {
    expect(countActive(EMPTY_FILTERS)).toBe(0);
    expect(
      countActive({
        minPrice: 100,
        maxPrice: 0,
        bedrooms: 2,
        superhost: true,
        amenities: ["Pool", "WiFi"],
      })
    ).toBe(5);
  });
});

describe("<FiltersModal />", () => {
  it("renders nothing when closed", () => {
    render(
      <FiltersModal open={false} initial={EMPTY_FILTERS} onClose={() => {}} onApply={() => {}} />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is an accessible dialog that applies the chosen filters", async () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    render(<FiltersModal open initial={EMPTY_FILTERS} onClose={onClose} onApply={onApply} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Filters");

    await userEvent.click(screen.getByRole("button", { name: "Pool" }));
    await userEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ amenities: ["Pool"] }));
    expect(onClose).toHaveBeenCalled();
  });

  it("starts from the last applied filters each time it opens and can clear them", async () => {
    const onApply = vi.fn();
    const initial = { ...EMPTY_FILTERS, superhost: true, amenities: ["WiFi"] };
    render(<FiltersModal open initial={initial} onClose={() => {}} onApply={onApply} />);
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }));
    await userEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(onApply).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<FiltersModal open initial={EMPTY_FILTERS} onClose={onClose} onApply={() => {}} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
