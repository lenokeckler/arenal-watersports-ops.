import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/types";
import {
  RESERVATION_STATUS,
  RESERVATION_TYPE,
} from "@/app/constants";
import { fetchPendingDispatchReservationsForCategory } from "../dispatchByCategory";

interface FakeQueryBuilder extends PromiseLike<{
  data: unknown;
  error: null;
}> {
  eq: (column: string, value: unknown) => FakeQueryBuilder;
  gte: (column: string, value: unknown) => FakeQueryBuilder;
  in: (
    column: string,
    values: unknown[]
  ) => FakeQueryBuilder;
  lt: (column: string, value: unknown) => FakeQueryBuilder;
  order: (column: string) => FakeQueryBuilder;
}

const buildFakeQueryBuilder = (
  data: unknown
): FakeQueryBuilder => {
  const builder: FakeQueryBuilder = {
    eq: () => builder,
    gte: () => builder,
    in: () => builder,
    lt: () => builder,
    order: () => builder,
    then: (onFulfilled) =>
      Promise.resolve({ data, error: null }).then(
        onFulfilled
      ),
  };
  return builder;
};

const buildReservationRow = (
  id: string,
  type: (typeof RESERVATION_TYPE)[keyof typeof RESERVATION_TYPE]
) => ({
  code: `R-${id}`,
  customer_name: "Cliente",
  dispatched_at: null,
  duration_minutes: 60,
  ends_at: "2026-08-30T12:00:00.000Z",
  extra_time_minutes: 0,
  id,
  people_count: 2,
  reservation_guides: [],
  reservation_items: [],
  starts_at: "2026-08-30T11:00:00.000Z",
  status: RESERVATION_STATUS.SCHEDULED,
  type,
});

/**
 * Only `from("reservations")` and `from("reservation_items")` are mocked —
 * enough to exercise the two-query narrowing without a real Supabase client.
 */
const buildSupabaseMock = (
  reservationRows: unknown[],
  itemRows: unknown[]
): SupabaseClient<Database> => {
  const from = vi.fn((table: string) => ({
    select: () =>
      buildFakeQueryBuilder(
        table === "reservations"
          ? reservationRows
          : itemRows
      ),
  }));
  return { from } as unknown as SupabaseClient<Database>;
};

describe("fetchPendingDispatchReservationsForCategory", () => {
  it("keeps only the reservations whose items resolve to the requested category", async () => {
    const supabase = buildSupabaseMock(
      [
        buildReservationRow(
          "reservation-1",
          RESERVATION_TYPE.RENTAL
        ),
        buildReservationRow(
          "reservation-2",
          RESERVATION_TYPE.RENTAL
        ),
      ],
      [{ reservation_id: "reservation-1" }]
    );

    const result =
      await fetchPendingDispatchReservationsForCategory(
        supabase,
        "category-1",
        "2026-08-30T00:00:00.000Z",
        "2026-08-31T00:00:00.000Z"
      );

    expect(
      result.map((reservation) => reservation.id)
    ).toEqual(["reservation-1"]);
  });

  it("excludes a combo reservation even when its items match the category", async () => {
    const supabase = buildSupabaseMock(
      [
        buildReservationRow(
          "reservation-combo",
          RESERVATION_TYPE.COMBO
        ),
      ],
      [{ reservation_id: "reservation-combo" }]
    );

    const result =
      await fetchPendingDispatchReservationsForCategory(
        supabase,
        "category-1",
        "2026-08-30T00:00:00.000Z",
        "2026-08-31T00:00:00.000Z"
      );

    expect(result).toEqual([]);
  });

  it("returns an empty array without a second query when every pending reservation is a combo", async () => {
    const supabase = buildSupabaseMock(
      [
        buildReservationRow(
          "reservation-combo",
          RESERVATION_TYPE.COMBO
        ),
      ],
      []
    );

    const result =
      await fetchPendingDispatchReservationsForCategory(
        supabase,
        "category-1",
        "2026-08-30T00:00:00.000Z",
        "2026-08-31T00:00:00.000Z"
      );

    expect(result).toEqual([]);
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});
