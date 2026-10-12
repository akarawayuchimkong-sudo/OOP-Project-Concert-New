/**
 * ============================================================
 * OOP: ABSTRACTION + POLYMORPHISM (Abstract Class + Override)
 * ============================================================
 * Abstract PaymentMethod – defines the contract for all payment types.
 * Concrete classes (PromptPayPayment, CreditCardPayment) implement
 * the abstract methods differently → Polymorphism.
 */

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

/**
 * Abstract base class for payment methods.
 * Abstraction: Caller only needs to know "pay()" and "getReceipt()",
 * without caring how PromptPay or Credit Card works internally.
 */
export abstract class PaymentMethod {
  // Encapsulation
  protected amount: number;
  protected orderId: string;
  protected status: PaymentStatus = 'pending';
  protected transactionId: string | null = null;
  protected paidAt: number | null = null;

  constructor(orderId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('จำนวนเงินต้องมากกว่า 0');
    }
    this.orderId = orderId;
    this.amount = amount;
  }

  getAmount(): number {
    return this.amount;
  }

  getStatus(): PaymentStatus {
    return this.status;
  }

  getTransactionId(): string | null {
    return this.transactionId;
  }

  getPaidAt(): number | null {
    return this.paidAt;
  }

  // ========== ABSTRACTION + POLYMORPHISM ==========
  /** Each payment method implements its own payment flow */
  abstract processPayment(): Promise<boolean>;

  /** Each payment method has its own receipt format */
  abstract getReceipt(): string;

  /** Common utility (can be used by subclasses) */
  protected markAsSuccess(txId: string): void {
    this.status = 'success';
    this.transactionId = txId;
    this.paidAt = Date.now();
  }

  protected markAsFailed(): void {
    this.status = 'failed';
  }
}

/**
 * Concrete implementation: PromptPay (QR)
 * Polymorphism: different processPayment() behavior
 */
export class PromptPayPayment extends PaymentMethod {
  private qrPayload: string;

  constructor(orderId: string, amount: number) {
    super(orderId, amount);
    // Generate a simple PromptPay-like payload
    this.qrPayload = `00020101021229370016A00000067701011101130066${orderId.slice(-10)}5303764540${amount.toFixed(2)}5802TH6304`;
  }

  getQrPayload(): string {
    return this.qrPayload;
  }

  // ========== POLYMORPHISM: Override ==========
  async processPayment(): Promise<boolean> {
    // Simulate network delay of PromptPay confirmation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Demo: always succeed (in real system would check bank API)
    const txId = `PP-${Date.now().toString().slice(-8)}`;
    this.markAsSuccess(txId);
    return true;
  }

  // ========== POLYMORPHISM: Override ==========
  getReceipt(): string {
    return [
      '===== ใบเสร็จ PromptPay =====',
      `Order   : ${this.orderId}`,
      `Amount  : ฿${this.amount.toLocaleString()}`,
      `TX ID   : ${this.transactionId}`,
      `Time    : ${this.paidAt ? new Date(this.paidAt).toLocaleString('th-TH') : '-'}`,
      '============================',
    ].join('\n');
  }
}

/**
 * Concrete implementation: Credit Card
 * Polymorphism: different processPayment() behavior
 */
export class CreditCardPayment extends PaymentMethod {
  private last4Digits: string;
  private cardHolder: string;

  constructor(
    orderId: string,
    amount: number,
    last4Digits: string = '4242',
    cardHolder: string = 'Card Holder'
  ) {
    super(orderId, amount);
    this.last4Digits = last4Digits;
    this.cardHolder = cardHolder;
  }

  // ========== POLYMORPHISM: Override ==========
  async processPayment(): Promise<boolean> {
    // Simulate card authorization
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Demo success
    const txId = `CC-${Date.now().toString().slice(-8)}`;
    this.markAsSuccess(txId);
    return true;
  }

  // ========== POLYMORPHISM: Override ==========
  getReceipt(): string {
    return [
      '===== ใบเสร็จบัตรเครดิต =====',
      `Order   : ${this.orderId}`,
      `Card    : **** **** **** ${this.last4Digits}`,
      `Holder  : ${this.cardHolder}`,
      `Amount  : ฿${this.amount.toLocaleString()}`,
      `TX ID   : ${this.transactionId}`,
      `Time    : ${this.paidAt ? new Date(this.paidAt).toLocaleString('th-TH') : '-'}`,
      '============================',
    ].join('\n');
  }
}
