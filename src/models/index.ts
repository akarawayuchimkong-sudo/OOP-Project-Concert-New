/**
 * ============================================================
 * ConcertPass Domain Models – OOP Layer
 * ============================================================
 * This folder demonstrates the 4 pillars of Object-Oriented Programming
 * required by the Mini Project assignment.
 *
 * 1. ABSTRACTION
 *    - User (abstract class)
 *    - PaymentMethod (abstract class)
 *    → Hide implementation details, expose only necessary interface.
 *
 * 2. ENCAPSULATION
 *    - All classes use private fields (#field) + getters/setters
 *    - State changes are controlled through methods (e.g. Ticket.checkIn())
 *
 * 3. INHERITANCE
 *    - Customer  extends User
 *    - Organizer extends User
 *    - GateStaff extends User
 *    - PromptPayPayment  extends PaymentMethod
 *    - CreditCardPayment extends PaymentMethod
 *
 * 4. POLYMORPHISM
 *    - Override getPermissions() in each User subclass
 *    - Override processPayment() & getReceipt() in each PaymentMethod subclass
 *    - Override getRoleDisplayName()
 *
 * Classes (designed by us – count ≥ 5):
 *   1. User (abstract)
 *   2. Customer
 *   3. Organizer
 *   4. GateStaff
 *   5. PaymentMethod (abstract)
 *   6. PromptPayPayment
 *   7. CreditCardPayment
 *   8. Ticket
 *   9. Order
 *  10. ConcertEvent
 */

export { User } from './User';
export type { UserRole } from './User';
export { Customer } from './Customer';
export { Organizer } from './Organizer';
export { GateStaff } from './GateStaff';
export { PaymentMethod, PromptPayPayment, CreditCardPayment } from './PaymentMethod';
export type { PaymentStatus } from './PaymentMethod';
export { Ticket } from './Ticket';
export type { TicketStatus } from './Ticket';
export { Order } from './Order';
export type { OrderStatus, PaymentMethodType } from './Order';
export { ConcertEvent } from './ConcertEvent';
export type { ConcertStatus } from './ConcertEvent';

/**
 * Factory helper – creates the correct User subclass from plain data.
 * (Avoids circular import issues)
 */
import { Customer } from './Customer';
import { Organizer } from './Organizer';
import { GateStaff } from './GateStaff';
import type { UserRole } from './User';
import { User } from './User';

export function createUserFromPlain(data: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: number;
}): User {
  switch (data.role) {
    case 'customer':
      return new Customer(data.id, data.name, data.email, data.phone, data.createdAt);
    case 'organizer':
      return new Organizer(data.id, data.name, data.email, data.phone, data.createdAt);
    case 'gate_staff':
      return new GateStaff(data.id, data.name, data.email, data.phone, data.createdAt);
    default:
      throw new Error(`Unknown role: ${(data as any).role}`);
  }
}
