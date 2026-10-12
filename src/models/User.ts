/**
 * ============================================================
 * OOP PRINCIPLE: ABSTRACTION + ENCAPSULATION + INHERITANCE BASE
 * ============================================================
 * Abstract base class for all users in the ConcertPass system.
 * - Abstraction: Hides the complexity of user identity & permissions.
 * - Encapsulation: Private fields (#) with controlled access via getters/setters.
 * - Inheritance: Base for Customer, Organizer, GateStaff.
 */

export type UserRole = 'customer' | 'organizer' | 'gate_staff';

export abstract class User {
  // ========== ENCAPSULATION: private fields ==========
  #id: string;
  #name: string;
  #email: string;
  #phone: string | undefined;
  #role: UserRole;
  #createdAt: number;

  constructor(
    id: string,
    name: string,
    email: string,
    role: UserRole,
    phone?: string,
    createdAt: number = Date.now()
  ) {
    this.#id = id;
    this.#name = name;
    this.#email = email;
    this.#role = role;
    this.#phone = phone;
    this.#createdAt = createdAt;
  }

  // ========== ENCAPSULATION: public getters (read-only access) ==========
  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get email(): string {
    return this.#email;
  }

  get phone(): string | undefined {
    return this.#phone;
  }

  get role(): UserRole {
    return this.#role;
  }

  get createdAt(): number {
    return this.#createdAt;
  }

  // ========== ENCAPSULATION: controlled setters ==========
  setName(newName: string): void {
    if (!newName || newName.trim().length < 2) {
      throw new Error('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
    }
    this.#name = newName.trim();
  }

  setPhone(newPhone: string): void {
    this.#phone = newPhone;
  }

  // ========== POLYMORPHISM: abstract method (must be overridden) ==========
  /**
   * Each role has different permissions / capabilities.
   * Subclasses MUST implement this method (Polymorphism via Override).
   */
  abstract getPermissions(): string[];

  /**
   * Display friendly role name (can be overridden).
   */
  getRoleDisplayName(): string {
    switch (this.#role) {
      case 'customer':
        return 'ลูกค้า (Customer)';
      case 'organizer':
        return 'ผู้จัดงาน (Organizer)';
      case 'gate_staff':
        return 'เจ้าหน้าที่ Gate (Gate Staff)';
      default:
        return this.#role;
    }
  }

  /**
   * Convert to plain object (for React state / localStorage compatibility).
   */
  toPlainObject(): {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    createdAt: number;
  } {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      phone: this.#phone,
      role: this.#role,
      createdAt: this.#createdAt,
    };
  }
}

