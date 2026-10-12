/**
 * ============================================================
 * OOP: INHERITANCE + POLYMORPHISM (Override)
 * ============================================================
 * GateStaff extends User
 */

import { User } from './User';

export class GateStaff extends User {
  #assignedGate: string;

  constructor(
    id: string,
    name: string,
    email: string,
    phone?: string,
    createdAt: number = Date.now(),
    assignedGate: string = 'Gate A'
  ) {
    super(id, name, email, 'gate_staff', phone, createdAt);
    this.#assignedGate = assignedGate;
  }

  get assignedGate(): string {
    return this.#assignedGate;
  }

  // ========== POLYMORPHISM: Override ==========
  getPermissions(): string[] {
    return [
      'scan_tickets',
      'check_in_ticket',
      'view_ticket_status',
      'view_own_audit',
    ];
  }

  override getRoleDisplayName(): string {
    return `เจ้าหน้าที่ Gate • ${this.name} (${this.#assignedGate})`;
  }

  /**
   * GateStaff-specific method
   */
  getCheckInMessage(ticketHolderName: string): string {
    return `[${this.#assignedGate}] เช็คอินสำเร็จสำหรับ ${ticketHolderName} โดย ${this.name}`;
  }
}
