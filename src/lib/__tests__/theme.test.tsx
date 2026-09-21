import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, resolveMode } from "@/lib/theme";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

describe("resolveMode", () => {
  it("follows the OS preference only in system mode", () => {
    expect(resolveMode("light", true)).toBe("light");
    expect(resolveMode("dark", false)).toBe("dark");
    expect(resolveMode("system", true)).toBe("dark");
    expect(resolveMode("system", false)).toBe("light");
  });
});

describe("<ThemeSwitcher />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("switches the document theme and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>
    );
    await user.click(screen.getByRole("button", { name: /theme settings/i }));
    const dark = screen.getByTestId("theme-dark");
    await user.click(dark);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(dark).toHaveAttribute("aria-pressed", "true");
    expect(localStorage.getItem("staynest.theme.v1")).toContain("dark");

    await user.click(screen.getByTestId("theme-light"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
