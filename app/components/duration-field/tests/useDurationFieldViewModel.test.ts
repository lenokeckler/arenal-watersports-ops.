import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDurationFieldViewModel } from "../hooks/useDurationFieldViewModel";

describe("useDurationFieldViewModel", () => {
  it("highlights the matching preset and reads its own label", () => {
    const { result } = renderHook(() =>
      useDurationFieldViewModel({
        onChangeMinutes: vi.fn(),
        valueMinutes: 90,
      })
    );

    expect(result.current.selectedPreset).toBe(90);
    expect(result.current.readableLabel).toBe("1.5h");
    expect(result.current.rawMinutesValue).toBe("90");
  });

  it("highlights no preset and computes a readable label for a custom value", () => {
    const { result } = renderHook(() =>
      useDurationFieldViewModel({
        onChangeMinutes: vi.fn(),
        valueMinutes: 100,
      })
    );

    expect(result.current.selectedPreset).toBeNull();
    expect(result.current.readableLabel).toBe("1h 40m");
    expect(result.current.rawMinutesValue).toBe("100");
  });

  it("shows an empty free-form value and caption for a cleared duration", () => {
    const { result } = renderHook(() =>
      useDurationFieldViewModel({
        onChangeMinutes: vi.fn(),
        valueMinutes: 0,
      })
    );

    expect(result.current.rawMinutesValue).toBe("");
    expect(result.current.readableLabel).toBe("");
  });

  it("reports the preset's own minutes when a preset button is tapped", () => {
    const handleChangeMinutes = vi.fn();
    const { result } = renderHook(() =>
      useDurationFieldViewModel({
        onChangeMinutes: handleChangeMinutes,
        valueMinutes: 60,
      })
    );

    result.current.handlePresetSelect(180);

    expect(handleChangeMinutes).toHaveBeenCalledWith(180);
  });

  it("reports the typed minutes from the free-form field", () => {
    const handleChangeMinutes = vi.fn();
    const { result } = renderHook(() =>
      useDurationFieldViewModel({
        onChangeMinutes: handleChangeMinutes,
        valueMinutes: 60,
      })
    );

    result.current.handleRawMinutesChange("45");

    expect(handleChangeMinutes).toHaveBeenCalledWith(45);
  });
});
