export type BookingSection = "active" | "completed" | "cancelled";

function normStatus(status: unknown): string {
  return String(status ?? "").toLowerCase();
}

/** Client-side filter — GET /bookings/history/ returns all customer bookings (no section query param). */
export function filterBookingsBySection<T extends { status?: unknown }>(
  bookings: T[],
  section: BookingSection
): T[] {
  if (section === "active") {
    return bookings.filter((b) =>
      ["pending", "accepted", "ongoing"].includes(normStatus(b.status))
    );
  }
  if (section === "completed") {
    return bookings.filter((b) => normStatus(b.status) === "completed");
  }
  return bookings.filter((b) => normStatus(b.status) === "cancelled");
}

export function parseBookingList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
    return (data as { results: unknown[] }).results;
  }
  return [];
}
