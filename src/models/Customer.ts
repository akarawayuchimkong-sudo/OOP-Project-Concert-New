/**
 * ============================================================
 * OOP: INHERITANCE + POLYMORPHISM (Override)
 * ============================================================
 * Customer extends User
 * - Inheritance: inherits all properties & methods from User
 * - Polymorphism: overrides getPermissions() and getRoleDisplayName()
 */

import { User } from './User';

export class Customer extends User {
  // Additional encapsulated field specific to Customer
  #loyaltyPoints: number;

  constructor(
    id: string,
    name: string,
    email: string,
    phone?: string,
    createdAt: number = Date.now(),
    loyaltyPoints: number = 0
  ) {
    super(id, name, email, 'customer', phone, createdAt); // call parent constructor
    this.#loyaltyPoints = loyaltyPoints;
  }

  // ========== ENCAPSULATION ==========
  get loyaltyPoints(): number {
    return this.#loyaltyPoints;
  }

  addLoyaltyPoints(points: number): void {
    if (points > 0) {
      this.#loyaltyPoints += points;
    }
  }

  // ========== POLYMORPHISM: Override abstract method ==========
  getPermissions(): string[] {
    return [
      'view_concerts',
      'select_seats',
      'purchase_tickets',
      'view_my_tickets',
      'request_refund',
    ];
  }

  // ========== POLYMORPHISM: Override method ==========
  override getRoleDisplayName(): string {
    return `ลูกค้า • ${this.name} (${this.#loyaltyPoints} แต้มสะสม)`;
  }

  /**
   * Customer-specific behavior
   */
  canPurchaseMore(currentTicketCount: number, limit: number = 4): boolean {
    return currentTicketCount < limit;
  }
}
