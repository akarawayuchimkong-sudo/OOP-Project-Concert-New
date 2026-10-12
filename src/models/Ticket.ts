/**
 * ============================================================
 * OOP: ENCAPSULATION + simple domain class
 * ============================================================
 * Ticket class – represents a single concert ticket.
 * Encapsulates status transitions (valid → used).
 */

export type TicketStatus = 'valid' | 'used';

export class Ticket {
  // ========== ENCAPSULATION ==========
  #id: string;
  #orderId: string;
  #concertId: string;
  #concertTitle: string;
  #artist: string;
  #venue: string;
  #date: string;
  #time: string;
  #zoneName: string;
  #seatLabel: string;
  #price: number;
  #attendeeName: string;
  #qrCodeString: string;
  #status: TicketStatus;
  #checkedInAt: number | undefined;
  #gateStaffName: string | undefined;

  constructor(params: {
    id: string;
    orderId: string;
    concertId: string;
    concertTitle: string;
    artist: string;
    venue: string;
    date: string;
    time: string;
    zoneName: string;
    seatLabel: string;
    price: number;
    attendeeName: string;
    qrCodeString: string;
    status?: TicketStatus;
    checkedInAt?: number;
    gateStaffName?: string;
  }) {
    this.#id = params.id;
    this.#orderId = params.orderId;
    this.#concertId = params.concertId;
    this.#concertTitle = params.concertTitle;
    this.#artist = params.artist;
    this.#venue = params.venue;
    this.#date = params.date;
    this.#time = params.time;
    this.#zoneName = params.zoneName;
    this.#seatLabel = params.seatLabel;
    this.#price = params.price;
    this.#attendeeName = params.attendeeName;
    this.#qrCodeString = params.qrCodeString;
    this.#status = params.status ?? 'valid';
    this.#checkedInAt = params.checkedInAt;
    this.#gateStaffName = params.gateStaffName;
  }

  // Getters
  get id() { return this.#id; }
  get orderId() { return this.#orderId; }
  get concertId() { return this.#concertId; }
  get concertTitle() { return this.#concertTitle; }
  get artist() { return this.#artist; }
  get venue() { return this.#venue; }
  get date() { return this.#date; }
  get time() { return this.#time; }
  get zoneName() { return this.#zoneName; }
  get seatLabel() { return this.#seatLabel; }
  get price() { return this.#price; }
  get attendeeName() { return this.#attendeeName; }
  get qrCodeString() { return this.#qrCodeString; }
  get status() { return this.#status; }
  get checkedInAt() { return this.#checkedInAt; }
  get gateStaffName() { return this.#gateStaffName; }

  /**
   * Business rule: can only check-in a valid ticket once.
   * Returns true if check-in succeeded.
   */
  checkIn(gateStaffName: string): { success: boolean; message: string } {
    if (this.#status === 'used') {
      return {
        success: false,
        message: `บัตรใบนี้ถูกใช้ไปแล้วเมื่อ ${this.#checkedInAt ? new Date(this.#checkedInAt).toLocaleString('th-TH') : '-'}`,
      };
    }
    this.#status = 'used';
    this.#checkedInAt = Date.now();
    this.#gateStaffName = gateStaffName;
    return {
      success: true,
      message: `เช็คอินสำเร็จ • ที่นั่ง ${this.#seatLabel} • ${this.#attendeeName}`,
    };
  }

  isValid(): boolean {
    return this.#status === 'valid';
  }

  toPlainObject() {
    return {
      id: this.#id,
      orderId: this.#orderId,
      concertId: this.#concertId,
      concertTitle: this.#concertTitle,
      artist: this.#artist,
      venue: this.#venue,
      date: this.#date,
      time: this.#time,
      zoneName: this.#zoneName,
      seatLabel: this.#seatLabel,
      price: this.#price,
      attendeeName: this.#attendeeName,
      qrCodeString: this.#qrCodeString,
      status: this.#status,
      checkedInAt: this.#checkedInAt,
      gateStaffName: this.#gateStaffName,
    };
  }

  static fromPlainObject(data: any): Ticket {
    return new Ticket(data);
  }
}
