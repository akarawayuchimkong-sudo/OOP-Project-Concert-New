/**
 * ============================================================
 * OOP: INHERITANCE + POLYMORPHISM (Override)
 * ============================================================
 * Organizer extends User
 */

import { User } from './User';

export class Organizer extends User {
  #organizationName: string;

  constructor(
    id: string,
    name: string,
    email: string,
    phone?: string,
    createdAt: number = Date.now(),
    organizationName: string = 'Independent'
  ) {
    super(id, name, email, 'organizer', phone, createdAt);
    this.#organizationName = organizationName;
  }

  get organizationName(): string {
    return this.#organizationName;
  }

  setOrganizationName(name: string): void {
    this.#organizationName = name;
  }

  // ========== POLYMORPHISM: Override ==========
  getPermissions(): string[] {
    return [
      'view_concerts',
      'create_concert',
      'edit_concert',
      'close_sale',
      'open_sale',
      'view_sales_report',
      'view_audit_logs',
      'manage_zones',
    ];
  }

  override getRoleDisplayName(): string {
    return `ผู้จัดงาน • ${this.name} (${this.#organizationName})`;
  }

  /**
   * Organizer-specific method
   */
  canManageConcert(concertOrganizerId?: string): boolean {
    // Organizer can manage their own concerts or any if no owner set
    return !concertOrganizerId || concertOrganizerId === this.id;
  }
}
