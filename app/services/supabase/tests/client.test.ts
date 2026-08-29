import { describe, expect, it } from "vitest";
import { createBrowserSupabaseClient } from "@/app/services";

describe("createBrowserSupabaseClient", () => {
  it("expone las tablas del esquema con sus tipos", () => {
    const supabaseClient = createBrowserSupabaseClient();

    expect(supabaseClient.from("workers")).toBeDefined();
    expect(
      supabaseClient.from("reservations")
    ).toBeDefined();
    expect(
      supabaseClient.from("equipment_categories")
    ).toBeDefined();
  });
});
