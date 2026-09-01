import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { useLogoutConfirmation } from "../hooks/useLogoutConfirmation";

describe("useLogoutConfirmation", () => {
  it("starts without the confirmation armed", () => {
    const { result } = renderHook(() =>
      useLogoutConfirmation({ onLoggedOut: vi.fn() })
    );

    expect(result.current.isConfirmingLogout).toBe(false);
  });

  it("arms the confirmation after the first request", () => {
    const { result } = renderHook(() =>
      useLogoutConfirmation({ onLoggedOut: vi.fn() })
    );

    act(() => {
      result.current.handleRequestLogout();
    });

    expect(result.current.isConfirmingLogout).toBe(true);
  });

  it("disarms the confirmation when the drawer's close handler resets it", () => {
    const { result } = renderHook(() =>
      useLogoutConfirmation({ onLoggedOut: vi.fn() })
    );

    act(() => {
      result.current.handleRequestLogout();
    });
    expect(result.current.isConfirmingLogout).toBe(true);

    act(() => {
      result.current.resetConfirmation();
    });

    expect(result.current.isConfirmingLogout).toBe(false);
  });
});
