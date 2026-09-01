import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import { dispatchReservation } from "../dispatchReservation";

interface FakeQueryBuilder extends PromiseLike<{
  error: null;
}> {
  eq: (column: string, value: unknown) => FakeQueryBuilder;
}

const buildFakeQueryBuilder = (): FakeQueryBuilder => {
  const builder: FakeQueryBuilder = {
    eq: () => builder,
    then: (onFulfilled) =>
      Promise.resolve({ error: null }).then(onFulfilled),
  };
  return builder;
};

/**
 * Only `from(...).update(...)` is mocked — enough to capture what
 * `dispatchReservation` writes to each table without a real Supabase client.
 */
const buildSupabaseMock = (): {
  client: SupabaseClient<Database>;
  updatesByTable: Record<string, unknown[]>;
} => {
  const updatesByTable: Record<string, unknown[]> = {};
  const from = vi.fn((table: string) => ({
    update: vi.fn((patch: unknown) => {
      updatesByTable[table] = [
        ...(updatesByTable[table] ?? []),
        patch,
      ];
      return buildFakeQueryBuilder();
    }),
  }));
  const client = {
    from,
  } as unknown as SupabaseClient<Database>;
  return { client, updatesByTable };
};

describe("dispatchReservation", () => {
  it("mirrors the departure reading onto the unit's fuel_level and usage_total", async () => {
    const { client, updatesByTable } = buildSupabaseMock();

    await dispatchReservation(
      client,
      "reservation-1",
      [
        {
          fuelLevel: 3,
          itemId: "item-1",
          unitId: "unit-1",
          usageReading: 12.5,
        },
      ],
      "worker-1"
    );

    expect(updatesByTable.equipment_units).toEqual([
      {
        fuel_level: 3,
        updated_by: "worker-1",
        usage_total: 12.5,
      },
    ]);
  });

  it("omits fuel_level and usage_total from the unit patch when the reading is blank", async () => {
    const { client, updatesByTable } = buildSupabaseMock();

    await dispatchReservation(
      client,
      "reservation-1",
      [
        {
          fuelLevel: null,
          itemId: "item-1",
          unitId: "unit-1",
          usageReading: null,
        },
      ],
      "worker-1"
    );

    expect(updatesByTable.equipment_units).toEqual([
      { updated_by: "worker-1" },
    ]);
  });

  it("still writes fuel_out/usage_out onto the reservation item itself", async () => {
    const { client, updatesByTable } = buildSupabaseMock();

    await dispatchReservation(
      client,
      "reservation-1",
      [
        {
          fuelLevel: 2,
          itemId: "item-1",
          unitId: "unit-1",
          usageReading: 10,
        },
      ],
      "worker-1"
    );

    expect(updatesByTable.reservation_items).toEqual([
      {
        fuel_out: 2,
        updated_by: "worker-1",
        usage_out: 10,
      },
    ]);
  });

  it("writes one unit patch per reading when several motorized items dispatch together", async () => {
    const { client, updatesByTable } = buildSupabaseMock();

    await dispatchReservation(
      client,
      "reservation-1",
      [
        {
          fuelLevel: 4,
          itemId: "item-1",
          unitId: "unit-1",
          usageReading: null,
        },
        {
          fuelLevel: null,
          itemId: "item-2",
          unitId: "unit-2",
          usageReading: 5,
        },
      ],
      "worker-1"
    );

    expect(updatesByTable.equipment_units).toHaveLength(2);
    expect(updatesByTable.equipment_units).toContainEqual({
      fuel_level: 4,
      updated_by: "worker-1",
    });
    expect(updatesByTable.equipment_units).toContainEqual({
      updated_by: "worker-1",
      usage_total: 5,
    });
  });
});
