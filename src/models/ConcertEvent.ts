/**
 * ============================================================
 * OOP: ENCAPSULATION + domain class with behavior
 * ============================================================
 * ConcertEvent – richer version of Concert with methods.
 * Keeps the original interface data but adds encapsulated logic.
 */

import type { Zone, Seat, SeatStatus } from '../types/concert';

export type ConcertStatus = 'sale_open' | 'upcoming' | 'sold_out' | 'sale_closed';

export class ConcertEvent {
  #id: string;
  #title: string;
  #artist: string;
  #organizerName?: string;
  #organizerId?: string;
  #date: string;
  #time: string;
  #doorsOpen: string;
  #venue: string;
  #description: string;
  #category: string;
  #purchaseLimit: number;
  #status: ConcertStatus;
  #saleStartTimestamp?: number;
  #saleEndTimestamp?: number;
  #isSaleClosedManually: boolean;
  #accentColor: string;
  #gradientTheme: string;
  #posterUrl?: string;
  #zones: Zone[];
  #seats: Seat[];

  constructor(data: {
    id: string;
    title: string;
    artist: string;
    organizerName?: string;
    organizerId?: string;
    date: string;
    time: string;
    doorsOpen: string;
    venue: string;
    description: string;
    category: string;
    purchaseLimit: number;
    status: ConcertStatus;
    saleStartTimestamp?: number;
    saleEndTimestamp?: number;
    isSaleClosedManually?: boolean;
    accentColor: string;
    gradientTheme: string;
    posterUrl?: string;
    zones: Zone[];
    seats: Seat[];
  }) {
    this.#id = data.id;
    this.#title = data.title;
    this.#artist = data.artist;
    this.#organizerName = data.organizerName;
    this.#organizerId = data.organizerId;
    this.#date = data.date;
    this.#time = data.time;
    this.#doorsOpen = data.doorsOpen;
    this.#venue = data.venue;
    this.#description = data.description;
    this.#category = data.category;
    this.#purchaseLimit = data.purchaseLimit;
    this.#status = data.status;
    this.#saleStartTimestamp = data.saleStartTimestamp;
    this.#saleEndTimestamp = data.saleEndTimestamp;
    this.#isSaleClosedManually = data.isSaleClosedManually ?? false;
    this.#accentColor = data.accentColor;
    this.#gradientTheme = data.gradientTheme;
    this.#posterUrl = data.posterUrl;
    this.#zones = structuredClone(data.zones);
    this.#seats = structuredClone(data.seats);
  }

  // ========== Getters (Encapsulation) ==========
  get id() { return this.#id; }
  get title() { return this.#title; }
  get artist() { return this.#artist; }
  get organizerName() { return this.#organizerName; }
  get organizerId() { return this.#organizerId; }
  get date() { return this.#date; }
  get time() { return this.#time; }
  get doorsOpen() { return this.#doorsOpen; }
  get venue() { return this.#venue; }
  get description() { return this.#description; }
  get category() { return this.#category; }
  get purchaseLimit() { return this.#purchaseLimit; }
  get status() { return this.#status; }
  get saleStartTimestamp() { return this.#saleStartTimestamp; }
  get saleEndTimestamp() { return this.#saleEndTimestamp; }
  get isSaleClosedManually() { return this.#isSaleClosedManually; }
  get accentColor() { return this.#accentColor; }
  get gradientTheme() { return this.#gradientTheme; }
  get posterUrl() { return this.#posterUrl; }
  get zones() { return structuredClone(this.#zones); }
  get seats() { return structuredClone(this.#seats); }

  // ========== Business methods ==========
  isSaleClosed(currentTime: number = Date.now()): boolean {
    if (this.#isSaleClosedManually) return true;
    if (this.#status === 'sale_closed') return true;
    if (this.#saleEndTimestamp && currentTime >= this.#saleEndTimestamp) return true;
    return false;
  }

  isSaleUpcoming(currentTime: number = Date.now()): boolean {
    if (this.#isSaleClosedManually || this.#status === 'sale_closed') return false;
    if (this.#saleStartTimestamp) {
      return currentTime < this.#saleStartTimestamp;
    }
    return this.#status === 'upcoming';
  }

  canBook(currentTime: number = Date.now()): boolean {
    return !this.isSaleClosed(currentTime) && !this.isSaleUpcoming(currentTime) && this.#status !== 'sold_out';
  }

  closeSaleManually(): void {
    this.#isSaleClosedManually = true;
    this.#status = 'sale_closed';
  }

  openSaleImmediately(): void {
    this.#isSaleClosedManually = false;
    this.#saleStartTimestamp = Date.now() - 1000;
    this.#status = 'sale_open';
  }

  getAvailableSeatCount(): number {
    return this.#seats.filter((s) => s.status === 'available').length;
  }

  holdSeat(seatId: string, userId: string, holdMinutes: number = 15): boolean {
    const seat = this.#seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== 'available') return false;
    seat.status = 'held';
    seat.heldBy = userId;
    seat.heldExpiresAt = Date.now() + holdMinutes * 60 * 1000;
    return true;
  }

  releaseSeat(seatId: string): boolean {
    const seat = this.#seats.find((s) => s.id === seatId);
    if (!seat || seat.status !== 'held') return false;
    seat.status = 'available';
    seat.heldBy = undefined;
    seat.heldExpiresAt = undefined;
    return true;
  }

  markSeatsSold(seatIds: string[]): void {
    for (const id of seatIds) {
      const seat = this.#seats.find((s) => s.id === id);
      if (seat) {
        seat.status = 'sold';
        seat.heldBy = undefined;
        seat.heldExpiresAt = undefined;
      }
    }
    // Update available counts in zones
    for (const zone of this.#zones) {
      zone.availableCount = this.#seats.filter(
        (s) => s.zoneId === zone.id && s.status === 'available'
      ).length;
    }
  }

  toPlainObject() {
    return {
      id: this.#id,
      title: this.#title,
      artist: this.#artist,
      organizerName: this.#organizerName,
      organizerId: this.#organizerId,
      date: this.#date,
      time: this.#time,
      doorsOpen: this.#doorsOpen,
      venue: this.#venue,
      description: this.#description,
      category: this.#category,
      purchaseLimit: this.#purchaseLimit,
      status: this.#status,
      saleStartTimestamp: this.#saleStartTimestamp,
      saleEndTimestamp: this.#saleEndTimestamp,
      isSaleClosedManually: this.#isSaleClosedManually,
      accentColor: this.#accentColor,
      gradientTheme: this.#gradientTheme,
      posterUrl: this.#posterUrl,
      zones: this.#zones,
      seats: this.#seats,
    };
  }

  static fromPlainObject(data: any): ConcertEvent {
    return new ConcertEvent(data);
  }
}
