/**
 * Server-side source of truth for order packages. The frontend only ever
 * sends a `packageId` — the price actually charged is always resolved here,
 * never trusted from the client.
 */
export interface OrderPackage {
  id: string;
  name: string;
  /** Full package price in IDR. */
  price: number;
  /** Percentage of `price` charged now as a down payment (0-100). 100 = pay in full now. */
  dpPercent: number;
  /** Whether this package can be ordered/paid online, or requires a consultation first. */
  orderable: boolean;
}

export const PACKAGES: OrderPackage[] = [
  {
    id: "silver",
    name: "Silver",
    price: 700_000,
    dpPercent: 50,
    orderable: true,
  },
  {
    id: "gold",
    name: "Gold",
    price: 1_600_000,
    dpPercent: 50,
    orderable: true,
  },
  {
    id: "diamond",
    name: "Diamond",
    price: 2_000_000,
    dpPercent: 50,
    orderable: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 3_000_000,
    dpPercent: 50,
    orderable: true,
  },
];

export function getPackage(id: string): OrderPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function chargeAmount(pkg: OrderPackage): number {
  return Math.round((pkg.price * pkg.dpPercent) / 100);
}
