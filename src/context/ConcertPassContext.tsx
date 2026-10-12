import React, { createContext, useContext, useState, useEffect } from 'react';
import { Concert, Seat, Order, Ticket, CheckInResult, AuditLog, UserRole, UserAccount } from '../types/concert';
import { INITIAL_CONCERTS } from '../data/initialConcerts';
import { isConcertSaleClosed, isConcertSaleUpcoming, getConcertSaleStatus } from '../utils/concertSale';

// ========== OOP Domain Models (Mini Project – 4 OOP Principles) ==========
// Abstraction • Encapsulation • Inheritance • Polymorphism
// See src/models/ for full class implementations and comments.
import {
  createUserFromPlain,
  PromptPayPayment,
  CreditCardPayment,
  Ticket as TicketClass,
  Customer,
  Organizer,
  GateStaff,
} from '../models';

const DEMO_ACCOUNTS: Record<UserRole, UserAccount> = {
  customer: {
    id: 'usr-praew-2026',
    name: 'แพรว รักษ์ดนตรี',
    email: 'praew.music@example.com',
    phone: '081-234-5678',
    role: 'customer',
    createdAt: Date.now() - 86400000 * 30,
  },
  organizer: {
    id: 'usr-somchai-org',
    name: 'สมชาย ผู้จัดการค่าย',
    email: 'somchai.organizer@example.com',
    phone: '089-876-5432',
    role: 'organizer',
    createdAt: Date.now() - 86400000 * 60,
  },
  gate_staff: {
    id: 'usr-karn-gate',
    name: 'กานต์ เจ้าหน้าที่ประจำ Gate A',
    email: 'karn.gate@example.com',
    phone: '095-432-1098',
    role: 'gate_staff',
    createdAt: Date.now() - 86400000 * 10,
  },
};

interface ConcertPassContextType {
  // Auth & Roles
  isLoggedIn: boolean;
  currentUser: UserAccount | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (email: string, password?: string) => boolean;
  register: (data: { name: string; email: string; phone: string; password: string; role: UserRole }) => boolean;
  logout: () => void;
  quickLoginDemo: (role: UserRole) => void;

  // Concerts
  concerts: Concert[];
  activeConcertId: string | null;
  setActiveConcertId: (id: string | null) => void;
  addNewConcert: (concert: Concert) => void;
  updateConcert: (concert: Concert) => void;
  toggleSaleStatus: (concertId: string) => void;
  openSaleImmediately: (concertId: string) => void;
  currentTime: number;

  // Seat Selection & Temporary Hold
  selectedSeatIds: string[];
  holdTimeRemaining: number; // in seconds
  holdExpiresAt: number | null;
  toggleSeatSelection: (concertId: string, seatId: string) => { success: boolean; reason?: string };
  clearSelectedSeats: () => void;

  // Checkout & Payment
  activeOrder: Order | null;
  startCheckout: (concertId: string) => Order | null;
  processPayment: (orderId: string) => Promise<boolean>;
  cancelCurrentOrder: () => void;

  // Tickets
  tickets: Ticket[];
  getTicketsByOrderId: (orderId: string) => Ticket[];
  deleteTicket: (ticketId: string) => boolean;
  refundTicket: (ticketId: string) => { success: boolean; message: string; seatLabel?: string; concertTitle?: string };

  // Gate Scanner
  validateAndCheckInTicket: (ticketQrOrId: string, gateStaffName?: string) => CheckInResult;

  // Audit Logs & Stats
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, type: AuditLog['type']) => void;

  // Toast / System notice
  systemNotice: string | null;
  setSystemNotice: (notice: string | null) => void;
}

const ConcertPassContext = createContext<ConcertPassContextType | undefined>(undefined);

const HOLD_DURATION_SECONDS = 15 * 60; // 15 minutes as per BR-02

export const ConcertPassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole>('customer');
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccount[]>([
    DEMO_ACCOUNTS.customer,
    DEMO_ACCOUNTS.organizer,
    DEMO_ACCOUNTS.gate_staff,
  ]);
  const [concerts, setConcerts] = useState<Concert[]>(INITIAL_CONCERTS);
  const [activeConcertId, setActiveConcertId] = useState<string | null>(INITIAL_CONCERTS[0].id);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Real-time tick every second to accurately trigger ticket sale closing
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (isLoggedIn && currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const login = (email: string): boolean => {
    // Check if matches any registered or demo account
    const existing = registeredAccounts.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      setCurrentUser(existing);
      setUserRoleState(existing.role);
      setIsLoggedIn(true);

      // ★ OOP DEMO: Inheritance + Polymorphism
      // Create the correct subclass (Customer / Organizer / GateStaff)
      // then call the overridden getPermissions() & getRoleDisplayName()
      const userInstance = createUserFromPlain(existing);
      console.log('[OOP User]', userInstance.getRoleDisplayName());
      console.log('[OOP Permissions]', userInstance.getPermissions());

      addAuditLog('เข้าสู่ระบบสำเร็จ', `ผู้ใช้ ${existing.name} (${existing.email}) เข้าสู่ระบบ บทบาท: ${existing.role}`, 'security' as any);
      if (existing.role === 'organizer') {
        setConcerts((prev) =>
          prev.map((c) => ({
            ...c,
            organizerName: (!c.organizerName || c.organizerName === 'สมชาย ผู้จัดการค่าย') ? existing.name : c.organizerName,
          }))
        );
      }
      return true;
    }

    // Check if email suggests organizer or gate staff
    const lowerEmail = email.toLowerCase();
    const inferredRole: UserRole = lowerEmail.includes('org')
      ? 'organizer'
      : lowerEmail.includes('gate') || lowerEmail.includes('scan')
      ? 'gate_staff'
      : 'customer';

    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: email.split('@')[0],
      email,
      role: inferredRole,
      createdAt: Date.now(),
    };
    setRegisteredAccounts((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setUserRoleState(inferredRole);
    setIsLoggedIn(true);
    addAuditLog('เข้าสู่ระบบสำเร็จ', `ผู้ใช้ ${newUser.email} เข้าสู่ระบบสำเร็จ บทบาท: ${inferredRole}`, 'security' as any);
    if (inferredRole === 'organizer') {
      setConcerts((prev) =>
        prev.map((c) => ({
          ...c,
          organizerName: (!c.organizerName || c.organizerName === 'สมชาย ผู้จัดการค่าย') ? newUser.name : c.organizerName,
        }))
      );
    }
    return true;
  };

  const register = (data: { name: string; email: string; phone: string; password: string; role: UserRole }): boolean => {
    const newUser: UserAccount = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdAt: Date.now(),
    };
    setRegisteredAccounts((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setUserRoleState(data.role);
    setIsLoggedIn(true);
    addAuditLog('สมัครสมาชิกใหม่สำเร็จ', `สร้างบัญชีใหม่ ${data.name} (${data.email}) บทบาท: ${data.role}`, 'security' as any);

    if (data.role === 'organizer') {
      setConcerts((prev) =>
        prev.map((c) => ({
          ...c,
          organizerName: (!c.organizerName || c.organizerName === 'สมชาย ผู้จัดการค่าย') ? data.name : c.organizerName,
        }))
      );
    }

    return true;
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('ออกจากระบบ', `ผู้ใช้ ${currentUser.name} ออกจากระบบ`, 'security' as any);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRoleState('customer');
    clearSelectedSeats();
  };

  const quickLoginDemo = (role: UserRole) => {
    const demo = DEMO_ACCOUNTS[role];
    setCurrentUser(demo);
    setUserRoleState(demo.role);
    setIsLoggedIn(true);
    addAuditLog('เข้าสู่ระบบด่วน (Demo)', `สลับเข้าใช้งานในฐานะ ${demo.name} (${demo.role})`, 'security' as any);
  };

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number>(0);

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Initial pre-generated demo ticket for quick testing
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-DEMO-8821',
      orderId: 'ORD-DEMO-001',
      concertId: 'c-acoustic-park',
      concertTitle: 'Acoustic in the Park 2026',
      artist: 'Dept x Anatomy Rabbit x Greasy Cafe',
      venue: 'สวนรถไฟ Amphitheater, กรุงเทพฯ',
      date: '24 ต.ค. 2026',
      time: '18:00 - 22:30 น.',
      zoneName: 'VIP Zone (หน้าเวที)',
      seatLabel: 'A3',
      price: 1200,
      attendeeName: 'นิติ วัฒนากุล (ตัวอย่าง)',
      qrCodeString: 'CONCERTPASS:TCK-DEMO-8821:c-acoustic-park:A3:VIP:ACTIVE',
      status: 'valid',
    },
    {
      id: 'TCK-USED-1092',
      orderId: 'ORD-DEMO-002',
      concertId: 'c-acoustic-park',
      concertTitle: 'Acoustic in the Park 2026',
      artist: 'Dept x Anatomy Rabbit x Greasy Cafe',
      venue: 'สวนรถไฟ Amphitheater, กรุงเทพฯ',
      date: '24 ต.ค. 2026',
      time: '18:00 - 22:30 น.',
      zoneName: 'VIP Zone (หน้าเวที)',
      seatLabel: 'A4',
      price: 1200,
      attendeeName: 'กวิน เกียรติกร (ตัวอย่างเคยสแกนแล้ว)',
      qrCodeString: 'CONCERTPASS:TCK-USED-1092:c-acoustic-park:A4:VIP:ACTIVE',
      status: 'used',
      checkedInAt: Date.now() - 1000 * 60 * 45, // 45 minutes ago
      gateStaffName: 'กานต์ (Gate Staff)',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      timestamp: Date.now() - 1000 * 60 * 120,
      actor: 'สมชาย (Organizer)',
      role: 'organizer',
      action: 'สร้างรอบการแสดง',
      details: 'เปิดรอบการแสดง "Acoustic in the Park 2026" โควตา 400 ที่นั่ง',
      type: 'concert_create',
    },
    {
      id: 'log-2',
      timestamp: Date.now() - 1000 * 60 * 45,
      actor: 'กานต์ (Gate Staff)',
      role: 'gate_staff',
      action: 'สแกนเข้างานสำเร็จ',
      details: 'ตรวจสอบตั๋ว TCK-USED-1092 ที่นั่ง A4 โซน VIP ผ่าน',
      type: 'checkin',
    },
  ]);

  const [systemNotice, setSystemNotice] = useState<string | null>(null);

  const addAuditLog = (action: string, details: string, type: AuditLog['type']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      actor: currentUser?.name || 'ระบบอัตโนมัติ',
      role: userRole,
      action,
      details,
      type,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Timer Countdown for 15-minute Seat Hold (BR-02 & Scenario 4)
  useEffect(() => {
    if (!holdExpiresAt) {
      setHoldTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      setHoldTimeRemaining(remaining);

      // Scenario 4: Auto release when 15 minutes expire
      if (remaining <= 0) {
        clearInterval(interval);
        handleHoldExpiration();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, activeConcertId, selectedSeatIds]);

  const handleHoldExpiration = () => {
    if (selectedSeatIds.length > 0 && activeConcertId) {
      // Revert seats from 'held' back to 'available'
      setConcerts((prev) =>
        prev.map((c) => {
          if (c.id !== activeConcertId) return c;
          return {
            ...c,
            seats: c.seats.map((s) =>
              selectedSeatIds.includes(s.id) ? { ...s, status: 'available', heldBy: undefined } : s
            ),
          };
        })
      );

      addAuditLog(
        'หมดเวลาการจอง (Auto-Release)',
        `คืนสิทธิ์ที่นั่ง [${selectedSeatIds.join(', ')}] กลับสู่ระบบเนื่องจากเกิน 15 นาที`,
        'release'
      );
      setSystemNotice('หมดเวลาล็อกที่นั่ง 15 นาที ระบบทำการคืนสิทธิ์ที่นั่งกลับสู่สาธารณะอัตโนมัติ');
    }

    setSelectedSeatIds([]);
    setHoldExpiresAt(null);
    setActiveOrder(null);
  };

  // Toggle Seat Selection with Concurrency Lock (BR-01, BR-02)
  const toggleSeatSelection = (concertId: string, seatId: string): { success: boolean; reason?: string } => {
    const targetConcert = concerts.find((c) => c.id === concertId);
    if (!targetConcert) return { success: false, reason: 'ไม่พบคอนเสิร์ต' };

    // Check if ticket sales for this concert are closed
    if (isConcertSaleClosed(targetConcert, currentTime)) {
      return { success: false, reason: 'คอนเสิร์ตนี้ปิดการจำหน่ายตั๋วแล้วตามกำหนดเวลา ไม่สามารถเลือกที่นั่งได้' };
    }

    // Check if ticket sales for this concert are not yet open (Upcoming)
    if (isConcertSaleUpcoming(targetConcert, currentTime)) {
      const saleInfo = getConcertSaleStatus(targetConcert, currentTime);
      return {
        success: false,
        reason: `คอนเสิร์ตนี้ยังไม่เปิดให้จองตั๋ว (กำหนดเปิดจอง: ${saleInfo.openDateFormatted})`,
      };
    }

    const seat = targetConcert.seats.find((s) => s.id === seatId);
    if (!seat) return { success: false, reason: 'ไม่พบที่นั่ง' };

    // If already sold
    if (seat.status === 'sold') {
      return { success: false, reason: 'ที่นั่งนี้ถูกจำหน่ายไปแล้ว' };
    }

    // If held by someone else
    const currentUserId = currentUser?.id || 'usr-praew-2026';
    if (seat.status === 'held' && seat.heldBy && seat.heldBy !== currentUserId) {
      return { success: false, reason: 'ที่นั่งนี้กำลังอยู่ในระหว่างการทำรายการโดยผู้อื่น (Concurrency Lock)' };
    }

    const isAlreadySelected = selectedSeatIds.includes(seatId);

    if (isAlreadySelected) {
      // Deselect
      const newSelected = selectedSeatIds.filter((id) => id !== seatId);
      setSelectedSeatIds(newSelected);

      // Revert seat status to available
      setConcerts((prev) =>
        prev.map((c) => {
          if (c.id !== concertId) return c;
          return {
            ...c,
            seats: c.seats.map((s) => (s.id === seatId ? { ...s, status: 'available', heldBy: undefined } : s)),
          };
        })
      );

      if (newSelected.length === 0) {
        setHoldExpiresAt(null);
      }
      return { success: true };
    } else {
      // Check purchase limit (BR-01: max 4 per account)
      if (selectedSeatIds.length >= targetConcert.purchaseLimit) {
        return {
          success: false,
          reason: `จำกัดการซื้อสูงสุดไม่เกิน ${targetConcert.purchaseLimit} ที่นั่งต่อ 1 บัญชี (ตามกฎ BR-01)`,
        };
      }

      // Lock seat for this user
      const newSelected = [...selectedSeatIds, seatId];
      setSelectedSeatIds(newSelected);

      // Set/refresh 15-minute hold timer
      const expires = Date.now() + HOLD_DURATION_SECONDS * 1000;
      setHoldExpiresAt(expires);

      setConcerts((prev) =>
        prev.map((c) => {
          if (c.id !== concertId) return c;
          return {
            ...c,
            seats: c.seats.map((s) =>
              s.id === seatId
                ? { ...s, status: 'held', heldBy: currentUserId, heldExpiresAt: expires }
                : s
            ),
          };
        })
      );

      addAuditLog(
        'ล็อกที่นั่งชั่วคราว (Seat Hold)',
        `ผู้ใช้ ${currentUser?.name || 'แพรว'} ล็อกที่นั่ง ${seat.label} โซน ${seat.zoneName} (สิทธิ์ 15 นาที)`,
        'hold'
      );

      return { success: true };
    }
  };

  const clearSelectedSeats = () => {
    if (activeConcertId && selectedSeatIds.length > 0) {
      setConcerts((prev) =>
        prev.map((c) => {
          if (c.id !== activeConcertId) return c;
          return {
            ...c,
            seats: c.seats.map((s) =>
              selectedSeatIds.includes(s.id) ? { ...s, status: 'available', heldBy: undefined } : s
            ),
          };
        })
      );
    }
    setSelectedSeatIds([]);
    setHoldExpiresAt(null);
    setActiveOrder(null);
  };

  // Start Checkout
  const startCheckout = (concertId: string): Order | null => {
    const targetConcert = concerts.find((c) => c.id === concertId);
    if (!targetConcert || selectedSeatIds.length === 0) return null;

    if (isConcertSaleClosed(targetConcert, currentTime)) {
      setSystemNotice('คอนเสิร์ตนี้ปิดการจำหน่ายตั๋วแล้วตามกำหนดเวลา ไม่สามารถสั่งซื้อได้');
      return null;
    }

    if (isConcertSaleUpcoming(targetConcert, currentTime)) {
      setSystemNotice('คอนเสิร์ตนี้ยังไม่ถึงกำหนดเวลาเปิดจองตั๋ว ไม่สามารถดำเนินการสั่งซื้อได้');
      return null;
    }

    const selectedSeats = targetConcert.seats.filter((s) => selectedSeatIds.includes(s.id));
    const totalAmount = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const seatLabels = selectedSeats.map((s) => s.label);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: orderId,
      concertId: targetConcert.id,
      concertTitle: targetConcert.title,
      artist: targetConcert.artist,
      venue: targetConcert.venue,
      date: targetConcert.date,
      userId: currentUser?.id || 'usr-praew-2026',
      userName: currentUser?.name || 'แพรว รักษ์ดนตรี',
      userEmail: currentUser?.email || 'praew.music@example.com',
      seatLabels,
      totalAmount,
      paymentMethod: 'promptpay',
      status: 'pending',
      createdAt: Date.now(),
      qrPayload: `00020101021129370016A000000677010111011300668912345675802TH5407${totalAmount}.0053037646304${orderId}`,
    };

    setActiveOrder(newOrder);
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  // Automated Payment Confirmation (F-03: within < 5s automatic confirmation & E-Ticket generation)
  // ★ OOP DEMO: Polymorphism – choose concrete PaymentMethod at runtime
  const processPayment = async (orderId: string): Promise<boolean> => {
    const targetOrder = orders.find((o) => o.id === orderId) || activeOrder;
    if (!targetOrder) return false;

    // ========== POLYMORPHISM ==========
    // Create the correct PaymentMethod subclass based on order.paymentMethod
    // Both PromptPayPayment & CreditCardPayment extend abstract PaymentMethod
    // and override processPayment() / getReceipt() differently.
    const payment: PromptPayPayment | CreditCardPayment =
      targetOrder.paymentMethod === 'credit_card'
        ? new CreditCardPayment(targetOrder.id, targetOrder.totalAmount)
        : new PromptPayPayment(targetOrder.id, targetOrder.totalAmount);

    // Call the polymorphic method – actual behavior depends on the concrete class
    const paymentSuccess = await payment.processPayment();
    if (!paymentSuccess) {
      addAuditLog('ชำระเงินล้มเหลว', `คำสั่งซื้อ ${orderId} ชำระเงินไม่สำเร็จ`, 'purchase');
      return false;
    }

    // Log receipt from the polymorphic getReceipt()
    console.log('[OOP Payment Receipt]\n' + payment.getReceipt());

    const concert = concerts.find((c) => c.id === targetOrder.concertId);
    if (!concert) return false;

    // Mark seats as permanently 'sold'
    setConcerts((prev) =>
      prev.map((c) => {
        if (c.id !== targetOrder.concertId) return c;
        return {
          ...c,
          seats: c.seats.map((s) => {
            if (targetOrder.seatLabels.includes(s.label)) {
              return { ...s, status: 'sold', heldBy: undefined, heldExpiresAt: undefined };
            }
            return s;
          }),
        };
      })
    );

    // Update order status
    const confirmedOrder: Order = {
      ...targetOrder,
      status: 'confirmed',
      paidAt: Date.now(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? confirmedOrder : o)));
    setActiveOrder(confirmedOrder);

    // Generate individual secure E-Tickets (F-04)
    // ★ OOP DEMO: Use Ticket class (Encapsulation of status & checkIn logic)
    const generatedTickets: Ticket[] = targetOrder.seatLabels.map((label, idx) => {
      const seatObj = concert.seats.find((s) => s.label === label);
      const ticketId = `TCK-${Date.now().toString().slice(-4)}-${idx + 1}`;
      const qrPayload = `CONCERTPASS:${ticketId}:${concert.id}:${label}:${seatObj?.zoneName || 'STANDARD'}:${targetOrder.userName}`;

      // Create via class then convert to plain object for React state
      const ticketObj = new TicketClass({
        id: ticketId,
        orderId: targetOrder.id,
        concertId: concert.id,
        concertTitle: concert.title,
        artist: concert.artist,
        venue: concert.venue,
        date: concert.date,
        time: concert.time,
        zoneName: seatObj?.zoneName || 'Standard Zone',
        seatLabel: label,
        price: seatObj?.price || 0,
        attendeeName: targetOrder.userName,
        qrCodeString: qrPayload,
        status: 'valid',
      });
      return ticketObj.toPlainObject();
    });

    setTickets((prev) => [...generatedTickets, ...prev]);
    setSelectedSeatIds([]);
    setHoldExpiresAt(null);

    addAuditLog(
      'ชำระเงินสำเร็จ (Payment Success)',
      `คำสั่งซื้อ ${orderId} ยอดเงิน ฿${targetOrder.totalAmount.toLocaleString()} ออกตั๋ว E-Ticket จำนวน ${generatedTickets.length} ใบ | TX: ${payment.getTransactionId()}`,
      'purchase'
    );

    return true;
  };

  const cancelCurrentOrder = () => {
    handleHoldExpiration();
  };

  const getTicketsByOrderId = (orderId: string) => {
    return tickets.filter((t) => t.orderId === orderId);
  };

  // Gate Ticket Scanner Validation (BR-04, Feature F-07)
  // ★ OOP DEMO: Encapsulation – Ticket.checkIn() controls the status transition
  const validateAndCheckInTicket = (ticketQrOrId: string, gateStaffName = 'เจ้าหน้าที่หน้าประตู'): CheckInResult => {
    const trimmed = ticketQrOrId.trim();

    // Find ticket by ID or matching QR string
    const ticketPlain = tickets.find(
      (t) =>
        t.id.toLowerCase() === trimmed.toLowerCase() ||
        t.qrCodeString === trimmed ||
        t.qrCodeString.includes(trimmed)
    );

    if (!ticketPlain) {
      addAuditLog('สแกนไม่ผ่าน (Invalid Ticket)', `พบรหัสตั๋วไม่ถูกต้องหรือไม่มีในระบบ: "${trimmed}"`, 'checkin');
      return {
        status: 'invalid',
        message: 'บัตรไม่ถูกต้อง หรือไม่พบข้อมูลในรอบการแสดงนี้',
      };
    }

    // ========== ENCAPSULATION ==========
    // Reconstruct Ticket class instance so business rules live inside the class
    const ticketInstance = TicketClass.fromPlainObject(ticketPlain);

    // Use the encapsulated checkIn() method – status change is controlled by the class
    const result = ticketInstance.checkIn(gateStaffName);

    if (!result.success) {
      // Already used
      addAuditLog(
        'เตือนการใช้บัตรซ้ำ (Ticket Re-used Alert)',
        `พบการสแกนซ้ำ บัตร ${ticketPlain.id} (${ticketPlain.seatLabel}) สแกนแล้วเมื่อ ${new Date(
          ticketPlain.checkedInAt || 0
        ).toLocaleTimeString('th-TH')}`,
        'checkin'
      );
      return {
        status: 'already_used',
        message: 'บัตรนี้ถูกใช้งานแล้ว (Ticket Already Used)',
        ticket: ticketPlain,
        previousCheckInTime: ticketPlain.checkedInAt,
      };
    }

    // Success – persist the updated plain object back to React state
    const updatedTicket = ticketInstance.toPlainObject();
    setTickets((prev) => prev.map((t) => (t.id === ticketPlain.id ? updatedTicket : t)));

    addAuditLog(
      'เช็คอินเข้างานสำเร็จ (Check-in Verified)',
      `บัตร ${ticketPlain.id} [${ticketPlain.zoneName} ที่นั่ง ${ticketPlain.seatLabel}] ผู้ชม: ${ticketPlain.attendeeName} ผ่านประตูเรียบร้อย`,
      'checkin'
    );

    return {
      status: 'success',
      message: `บัตรถูกต้อง: ${ticketPlain.zoneName} ที่นั่ง ${ticketPlain.seatLabel}`,
      ticket: updatedTicket,
    };
  };

  // Delete ticket (only allowed if already scanned/used)
  const deleteTicket = (ticketId: string): boolean => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) return false;
    if (target.status !== 'used') {
      return false; // Can only delete tickets that have already been used!
    }
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    addAuditLog('ลบบัตรที่เข้างานแล้ว', `ลบประวัติบัตร ${target.id} (${target.seatLabel}) ออกจากกระเป๋า`, 'security' as any);
    return true;
  };

  // Refund ticket: returns ticket, frees up seat back to available in seat map
  const refundTicket = (ticketId: string) => {
    const target = tickets.find((t) => t.id === ticketId);
    if (!target) {
      return { success: false, message: 'ไม่พบข้อมูลบัตรที่ต้องการคืน' };
    }
    if (target.status === 'used') {
      return { success: false, message: 'บัตรนี้ถูกสแกนเข้างานไปแล้ว ไม่สามารถทำการคืนได้' };
    }

    // 1. Revert seat back to 'available' in the concert
    setConcerts((prev) =>
      prev.map((c) => {
        if (c.id !== target.concertId) return c;
        return {
          ...c,
          seats: c.seats.map((s) => {
            if (s.label === target.seatLabel) {
              return {
                ...s,
                status: 'available',
                heldBy: undefined,
                heldExpiresAt: undefined,
              };
            }
            return s;
          }),
        };
      })
    );

    // 2. Remove the ticket from tickets list
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));

    // 3. Add system audit log
    addAuditLog(
      'คืนบัตรและปลดล็อกที่นั่งว่าง (Ticket Refund)',
      `คืนบัตร ${target.id} [${target.zoneName} ที่นั่ง ${target.seatLabel}] งาน "${target.concertTitle}" คืนเงินและปลดล็อกที่นั่งกลับสู่ผังสำเร็จ`,
      'release'
    );

    return {
      success: true,
      message: `คืนบัตรที่นั่ง ${target.seatLabel} สำเร็จ! ที่นั่งถูกคืนสู่ระบบผังจองคิวเรียบร้อยแล้ว`,
      seatLabel: target.seatLabel,
      concertTitle: target.concertTitle,
    };
  };

  // Organizer: Add New Concert (F-05)
  const addNewConcert = (newConcert: Concert) => {
    const finalConcert: Concert = {
      ...newConcert,
      organizerName: newConcert.organizerName || currentUser?.name || 'สมชาย ผู้จัดการค่าย',
    };
    setConcerts((prev) => [finalConcert, ...prev]);
    setActiveConcertId(finalConcert.id);
    addAuditLog(
      'เพิ่มคอนเสิร์ตใหม่',
      `สร้างงาน "${finalConcert.title}" ศิลปิน ${finalConcert.artist} โดย ${finalConcert.organizerName} สถานที่ ${finalConcert.venue}`,
      'concert_create'
    );
  };

  // Organizer: Update Concert (Edit Concert Details / Time / Sale Closing)
  const updateConcert = (updatedConcert: Concert) => {
    setConcerts((prev) =>
      prev.map((c) => (c.id === updatedConcert.id ? updatedConcert : c))
    );
    addAuditLog(
      'แก้ไขข้อมูลคอนเสิร์ต',
      `แก้ไขงาน "${updatedConcert.title}" วันที่ ${updatedConcert.date} เวลาจัดคอนเสิร์ต ${updatedConcert.time} สถานที่ ${updatedConcert.venue}`,
      'concert_update'
    );
  };

  // Organizer: Toggle Sale Status (Manual Open/Close)
  const toggleSaleStatus = (concertId: string) => {
    setConcerts((prev) =>
      prev.map((c) => {
        if (c.id !== concertId) return c;
        const currentlyClosed = isConcertSaleClosed(c, currentTime);
        const willBeClosed = !currentlyClosed;

        const updated: Concert = {
          ...c,
          status: willBeClosed ? 'sale_closed' : 'sale_open',
          isSaleClosedManually: willBeClosed,
          saleEndTimestamp: willBeClosed
            ? Date.now()
            : (c.saleEndTimestamp && c.saleEndTimestamp < Date.now() ? Date.now() + 86400000 * 7 : c.saleEndTimestamp),
        };

        addAuditLog(
          willBeClosed ? 'ปิดการจำหน่ายตั๋ว' : 'เปิดการจำหน่ายตั๋ว',
          `${willBeClosed ? 'ปิด' : 'เปิด'}จำหน่ายตั๋วคอนเสิร์ต "${c.title}" โดย ${currentUser?.name || 'ผู้จัดงาน'}`,
          willBeClosed ? 'sale_close' : 'sale_open'
        );

        setSystemNotice(
          willBeClosed
            ? `ปิดการจำหน่ายตั๋ว "${c.title}" เรียบร้อยแล้ว`
            : `เปิดการจำหน่ายตั๋ว "${c.title}" เรียบร้อยแล้ว`
        );

        return updated;
      })
    );
  };

  // Organizer: Open Ticket Sale Immediately (for upcoming concerts or manual opening)
  const openSaleImmediately = (concertId: string) => {
    setConcerts((prev) =>
      prev.map((c) => {
        if (c.id !== concertId) return c;
        const updated: Concert = {
          ...c,
          status: 'sale_open',
          isSaleClosedManually: false,
          saleStartTimestamp: Date.now() - 1000,
          saleStartTime: 'เปิดจำหน่ายแล้ว',
          saleEndTimestamp:
            c.saleEndTimestamp && c.saleEndTimestamp > Date.now()
              ? c.saleEndTimestamp
              : Date.now() + 86400000 * 14,
        };

        addAuditLog(
          'เปิดจำหน่ายตั๋วทันที',
          `เริ่มเปิดให้จองตั๋วคอนเสิร์ต "${c.title}" ทันที โดย ${currentUser?.name || 'ผู้จัดงาน'}`,
          'sale_open'
        );

        setSystemNotice(`คอนเสิร์ต "${c.title}" เริ่มเปิดให้จองตั๋วแล้วตอนนี้!`);
        return updated;
      })
    );
  };

  return (
    <ConcertPassContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        userRole,
        setUserRole,
        login,
        register,
        logout,
        quickLoginDemo,
        concerts,
        activeConcertId,
        setActiveConcertId,
        addNewConcert,
        updateConcert,
        toggleSaleStatus,
        openSaleImmediately,
        currentTime,
        selectedSeatIds,
        holdTimeRemaining,
        holdExpiresAt,
        toggleSeatSelection,
        clearSelectedSeats,
        activeOrder,
        startCheckout,
        processPayment,
        cancelCurrentOrder,
        tickets,
        getTicketsByOrderId,
        deleteTicket,
        refundTicket,
        validateAndCheckInTicket,
        auditLogs,
        addAuditLog,
        systemNotice,
        setSystemNotice,
      }}
    >
      {children}
    </ConcertPassContext.Provider>
  );
};

export const useConcertPass = () => {
  const context = useContext(ConcertPassContext);
  if (!context) {
    throw new Error('useConcertPass must be used within a ConcertPassProvider');
  }
  return context;
};
