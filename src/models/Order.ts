/**
 * ============================================================
 * OOP: ENCAPSULATION
 * ============================================================
 * Order class – groups seats into a single purchase transaction.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethodType = 'promptpay' | 'credit_card';

export class Order {
  #id: string;
  #concertId: string;
  #concertTitle: string;
  #artist: string;
  #venue: string;
  #date: string;
  #userId: string;
  #userName: string;
  #userEmail: string;
  #seatLabels: string[];
  #totalAmount: number;
  #paymentMethod: PaymentMethodType;
  #status: OrderStatus;
  #createdAt: number;
  #paidAt: number | undefined;
  #qrPayload: string;

  constructor(params: {
    id: string;
    concertId: string;
    concertTitle: string;
    artist: string;
    venue: string;
    date: string;
    userId: string;
    userName: string;
    userEmail: string;
    seatLabels: string[];
    totalAmount: number;
    paymentMethod: PaymentMethodType;
    status?: OrderStatus;
    createdAt?: number;
    paidAt?: number;
    qrPayload?: string;
  }) {
    this.#id = params.id;
    this.#concertId = params.concertId;
    this.#concertTitle = params.concertTitle;
    this.#artist = params.artist;
    this.#venue = params.venue;
    this.#date = params.date;
    this.#userId = params.userId;
    this.#userName = params.userName;
    this.#userEmail = params.userEmail;
    this.#seatLabels = [...params.seatLabels];
    this.#totalAmount = params.totalAmount;
    this.#paymentMethod = params.paymentMethod;
    this.#status = params.status ?? 'pending';
    this.#createdAt = params.createdAt ?? Date.now();
    this.#paidAt = params.paidAt;
    this.#qrPayload = params.qrPayload ?? `ORDER-${params.id}`;
  }

  // Getters
  get id() { return this.#id; }
  get concertId() { return this.#concertId; }
  get concertTitle() { return this.#concertTitle; }
  get artist() { return this.#artist; }
  get venue() { return this.#venue; }
  get date() { return this.#date; }
  get userId() { return this.#userId; }
  get userName() { return this.#userName; }
  get userEmail() { return this.#userEmail; }
  get seatLabels() { return [...this.#seatLabels]; }
  get totalAmount() { return this.#totalAmount; }
  get paymentMethod() { return this.#paymentMethod; }
  get status() { return this.#status; }
  get createdAt() { return this.#createdAt; }
  get paidAt() { return this.#paidAt; }
  get qrPayload() { return this.#qrPayload; }

  /**
   * Confirm payment – changes status (Encapsulation of state change)
   */
  confirmPayment(): void {
    if (this.#status !== 'pending') {
      throw new Error('Order is not in pending state');
    }
    this.#status = 'confirmed';
    this.#paidAt = Date.now();
  }

  cancel(): void {
    if (this.#status === 'confirmed') {
      throw new Error('Cannot cancel a confirmed order');
    }
    this.#status = 'cancelled';
  }

  isPending(): boolean {
    return this.#status === 'pending';
  }

  isConfirmed(): boolean {
    return this.#status === 'confirmed';
  }

  toPlainObject() {
    return {
      id: this.#id,
      concertId: this.#concertId,
      concertTitle: this.#concertTitle,
      artist: this.#artist,
      venue: this.#venue,
      date: this.#date,
      userId: this.#userId,
      userName: this.#userName,
      userEmail: this.#userEmail,
      seatLabels: this.#seatLabels,
      totalAmount: this.#totalAmount,
      paymentMethod: this.#paymentMethod,
      status: this.#status,
      createdAt: this.#createdAt,
      paidAt: this.#paidAt,
      qrPayload: this.#qrPayload,
    };
  }

  static fromPlainObject(data: any): Order {
    return new Order(data);
  }
}
