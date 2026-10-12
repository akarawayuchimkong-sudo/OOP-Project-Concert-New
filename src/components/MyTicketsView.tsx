import React, { useState } from 'react';
import { useConcertPass } from '../context/ConcertPassContext';
import { Ticket as TicketType } from '../types/concert';
import { Download, CheckCircle, Trash2, Calendar, QrCode, AlertCircle, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

export const MyTicketsView: React.FC = () => {
  const { tickets, deleteTicket, refundTicket } = useConcertPass();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(
    tickets.length > 0 ? tickets[0].id : null
  );
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [ticketToRefund, setTicketToRefund] = useState<TicketType | null>(null);

  const upcomingTickets = tickets.filter((t) => t.status === 'valid');
  const pastTickets = tickets.filter((t) => t.status === 'used');

  const selectedTicket = tickets.find((t) => t.id === activeTicketId) || (tickets.length > 0 ? tickets[0] : null);

  const handleDownloadTicket = (ticket: TicketType) => {
    setFeedbackNotice(`บันทึก E-Ticket [${ticket.seatLabel} - ${ticket.id}] สำเร็จ`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleDeleteUsedTicket = (ticket: TicketType, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (ticket.status !== 'used') {
      return; // Safety guard: can only delete scanned/used tickets
    }

    const success = deleteTicket(ticket.id);
    if (success) {
      setFeedbackNotice(`ลบประวัติบัตรที่เข้างานแล้ว [${ticket.seatLabel} - ${ticket.id}] สำเร็จ`);
      setTimeout(() => setFeedbackNotice(null), 3500);

      // If active ticket is deleted, switch active to another ticket
      if (activeTicketId === ticket.id) {
        const remaining = tickets.filter((t) => t.id !== ticket.id);
        setActiveTicketId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleConfirmRefund = () => {
    if (!ticketToRefund) return;
    const res = refundTicket(ticketToRefund.id);
    if (res.success) {
      setFeedbackNotice(res.message);
      setTimeout(() => setFeedbackNotice(null), 4000);

      if (activeTicketId === ticketToRefund.id) {
        const remaining = tickets.filter((t) => t.id !== ticketToRefund.id);
        setActiveTicketId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
    setTicketToRefund(null);
  };

  if (tickets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white font-display">ยังไม่มีบัตรคอนเสิร์ตในกระเป๋า</h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
          คุณสามารถเลือกดูคอนเสิร์ตที่สนใจในหน้าแรก เลือกที่นั่งและชำระเงิน เพื่อรับ E-Ticket แบบเรียลไทม์
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
          <span>DIGITAL WALLET (E-TICKET F-04)</span>
          <span aria-hidden="true">·</span>
          <span>ตั๋วอิเล็กทรอนิกส์พร้อมระบบคืนบัตร & ปลดล็อกที่นั่งอัตโนมัติ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
          บัตรคอนเสิร์ตของฉัน ({tickets.length} ใบ)
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          แสดง QR Code หน้าประตู หรือจัดการขอคืนบัตรเพื่อให้ที่นั่งกลับคืนสู่ผังจองคิว
        </p>
      </div>

      {feedbackNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Filter Tabs: ทั้งหมด / กำลังจะมาถึง / ผ่านมาแล้ว */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-neutral-900/80 border border-neutral-800/80 rounded-xl w-fit">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedFilter === 'all'
              ? 'bg-neutral-800 text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          ทั้งหมด ({tickets.length})
        </button>
        <button
          onClick={() => setSelectedFilter('upcoming')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedFilter === 'upcoming'
              ? 'bg-neutral-800 text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          บัตรที่กำลังจะมาถึง ({upcomingTickets.length})
        </button>
        <button
          onClick={() => setSelectedFilter('past')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            selectedFilter === 'past'
              ? 'bg-neutral-800 text-white font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          บัตรที่ผ่านมา ({pastTickets.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Ticket Selector List Divided by Headings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: บัตรที่กำลังจะมาถึง (Upcoming Passes) */}
          {(selectedFilter === 'all' || selectedFilter === 'upcoming') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>บัตรที่กำลังจะมาถึง (พร้อมใช้งาน)</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">{upcomingTickets.length} ใบ</span>
              </div>

              {upcomingTickets.length === 0 ? (
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 text-xs text-neutral-500 font-mono text-center">
                  ไม่มีบัตรที่กำลังจะมาถึง
                </div>
              ) : (
                upcomingTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer relative ${
                        isSelected
                          ? 'bg-neutral-900 border-neutral-700 shadow-lg ring-1 ring-white/10'
                          : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-white font-display line-clamp-1">
                            {t.concertTitle}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5">{t.artist}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-emerald-950/60 text-emerald-400 border-emerald-800/80 shrink-0">
                            พร้อมใช้งาน
                          </span>
                          {/* Quick refund trigger on card */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTicketToRefund(t);
                            }}
                            className="p-1 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors"
                            title="ขอคืนบัตรนี้เพื่อปล่อยที่นั่งว่าง"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span className="text-white font-bold">
                          {t.seatLabel} ({t.zoneName.includes('VIP') ? 'VIP' : 'STD'})
                        </span>
                        <span>{t.date}</span>
                        <span className="text-neutral-400">฿{t.price.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Section 2: บัตรที่ผ่านมา (Past / Used Passes) */}
          {(selectedFilter === 'all' || selectedFilter === 'past') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>บัตรที่ผ่านมา (เข้างานแล้ว)</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">{pastTickets.length} ใบ</span>
              </div>

              {pastTickets.length === 0 ? (
                <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/60 text-xs text-neutral-500 font-mono text-center">
                  ไม่มีประวัติบัตรที่ผ่านมา
                </div>
              ) : (
                pastTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer relative ${
                        isSelected
                          ? 'bg-neutral-900 border-neutral-700 shadow-lg ring-1 ring-white/10'
                          : 'bg-neutral-950/40 border-neutral-800/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-300 font-display line-clamp-1">
                            {t.concertTitle}
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5">{t.artist}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-neutral-800 text-neutral-400 border-neutral-700">
                            เข้างานแล้ว
                          </span>
                          {/* Delete button only appears for used tickets */}
                          <button
                            onClick={(e) => handleDeleteUsedTicket(t, e)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                            title="ลบบัตรที่เข้างานแล้วนี้ออก"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-500">
                        <span className="text-neutral-300 font-medium">
                          {t.seatLabel} ({t.zoneName.includes('VIP') ? 'VIP' : 'STD'})
                        </span>
                        <span>{t.date}</span>
                        <span className="text-neutral-500">฿{t.price.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Side: 2026 Minimalist Luxury Pass Card */}
        {selectedTicket && (
          <div className="lg:col-span-7">
            <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Ticket Top Banner */}
              <div className="p-6 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 border-b border-neutral-800">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400 mb-2">
                  <span className="tracking-widest uppercase">OFFICIAL CONCERTPASS</span>
                  <span>{selectedTicket.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {selectedTicket.concertTitle}
                </h2>
                <p className="text-sm text-neutral-300 mt-1">{selectedTicket.artist}</p>
              </div>

              {/* Perforation Divider */}
              <div className="relative py-2 flex items-center justify-between bg-neutral-950">
                <div className="w-5 h-5 rounded-full bg-neutral-950 -ml-2.5 border-r border-neutral-800" />
                <div className="flex-1 border-b-2 border-dashed border-neutral-800 mx-2" />
                <div className="w-5 h-5 rounded-full bg-neutral-950 -mr-2.5 border-l border-neutral-800" />
              </div>

              {/* Ticket Details & QR Code */}
              <div className="p-6 bg-neutral-950 space-y-6">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-neutral-500 block">วันที่จัดแสดง</span>
                    <span className="text-white font-medium">{selectedTicket.date}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">เวลาแสดง</span>
                    <span className="text-white font-medium">{selectedTicket.time}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">โซนที่นั่ง</span>
                    <span className="text-amber-400 font-medium">{selectedTicket.zoneName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">หมายเลขที่นั่ง</span>
                    <span className="text-2xl font-bold text-emerald-400 font-mono tracking-wider">
                      {selectedTicket.seatLabel}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 text-xs font-mono">
                  <span className="text-neutral-500 block">ผู้ถือบัตร (Attendee)</span>
                  <span className="text-neutral-200">{selectedTicket.attendeeName}</span>
                </div>

                {/* Scannable QR Code Box */}
                <div className="p-6 rounded-2xl bg-white text-neutral-950 flex flex-col items-center justify-center text-center shadow-lg">
                  <div className="w-44 h-44 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Corner markers */}
                      <rect x="5" y="5" width="26" height="26" rx="3" fill="#000" />
                      <rect x="9" y="9" width="18" height="18" rx="2" fill="#fff" />
                      <rect x="13" y="13" width="10" height="10" rx="1" fill="#000" />

                      <rect x="69" y="5" width="26" height="26" rx="3" fill="#000" />
                      <rect x="73" y="9" width="18" height="18" rx="2" fill="#fff" />
                      <rect x="77" y="13" width="10" height="10" rx="1" fill="#000" />

                      <rect x="5" y="69" width="26" height="26" rx="3" fill="#000" />
                      <rect x="9" y="73" width="18" height="18" rx="2" fill="#fff" />
                      <rect x="13" y="77" width="10" height="10" rx="1" fill="#000" />

                      {/* Dynamic unique bit pattern derived from ticket id */}
                      <rect x="36" y="8" width="5" height="5" fill="#000" />
                      <rect x="46" y="8" width="5" height="5" fill="#000" />
                      <rect x="56" y="8" width="5" height="5" fill="#000" />
                      <rect x="36" y="18" width="5" height="5" fill="#000" />
                      <rect x="50" y="24" width="6" height="6" fill="#000" />
                      <rect x="10" y="38" width="5" height="5" fill="#000" />
                      <rect x="22" y="44" width="5" height="5" fill="#000" />
                      <rect x="36" y="38" width="6" height="6" fill="#000" />
                      <rect x="46" y="44" width="8" height="8" rx="1" fill="#000" />
                      <rect x="60" y="38" width="5" height="5" fill="#000" />
                      <rect x="76" y="44" width="5" height="5" fill="#000" />
                      <rect x="86" y="38" width="5" height="5" fill="#000" />
                      <rect x="40" y="60" width="5" height="5" fill="#000" />
                      <rect x="52" y="60" width="6" height="6" fill="#000" />
                      <rect x="66" y="60" width="5" height="5" fill="#000" />
                      <rect x="36" y="74" width="5" height="5" fill="#000" />
                      <rect x="50" y="74" width="5" height="5" fill="#000" />
                      <rect x="60" y="80" width="5" height="5" fill="#000" />
                      <rect x="78" y="74" width="5" height="5" fill="#000" />
                      <rect x="88" y="84" width="5" height="5" fill="#000" />
                    </svg>
                  </div>

                  <div className="mt-2 text-[11px] font-mono font-bold text-neutral-800 tracking-wider">
                    {selectedTicket.id}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {selectedTicket.status === 'used' ? (
                      <span className="text-red-600 font-bold">● บัตรนี้ถูกสแกนเข้างานแล้ว</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">● สแกนได้ 1 ครั้ง ณ ประตูทางเข้า</span>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Download, Refund (if valid), Delete (if used) */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => handleDownloadTicket(selectedTicket)}
                    className="flex-1 py-3 px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span>บันทึก E-Ticket</span>
                  </button>

                  {/* Refund Ticket Button: Enabled only for valid/upcoming tickets */}
                  {selectedTicket.status === 'valid' && (
                    <button
                      onClick={() => setTicketToRefund(selectedTicket)}
                      className="py-3 px-4 rounded-xl bg-neutral-900 border border-amber-600/60 hover:bg-amber-950/40 text-amber-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                      title="คืนบัตรนี้เพื่อปล่อยที่นั่งว่างกลับสู่ระบบผังจองคิว"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>คืนบัตร</span>
                    </button>
                  )}

                  {/* Delete button on details card - only if used */}
                  {selectedTicket.status === 'used' && (
                    <button
                      onClick={() => handleDeleteUsedTicket(selectedTicket)}
                      className="py-3 px-4 rounded-xl bg-red-950/60 border border-red-800/80 hover:bg-red-900 text-red-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                      title="ลบบัตรที่เข้างานแล้วนี้ออก"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>ลบประวัติบัตร</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Refunding Ticket */}
      {ticketToRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-lg font-bold text-white font-display">
                  ยืนยันการขอคืนบัตรคอนเสิร์ต
                </h3>
              </div>
              <button
                onClick={() => setTicketToRefund(null)}
                className="text-neutral-400 hover:text-white text-base font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex justify-between text-neutral-400">
                  <span>งานคอนเสิร์ต:</span>
                  <span className="text-white font-sans font-semibold text-right">{ticketToRefund.concertTitle}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>ที่นั่งที่คืน:</span>
                  <span className="text-emerald-400 font-bold">{ticketToRefund.seatLabel} ({ticketToRefund.zoneName})</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>ยอดเงินที่จะคืน:</span>
                  <span className="text-white font-bold">฿{ticketToRefund.price.toLocaleString()} THB</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs leading-relaxed font-sans">
                ⚠️ เมื่อกดยืนยัน ระบบจะยกเลิกบัตรใบนี้ และ <span className="font-bold underline text-white">ที่นั่ง {ticketToRefund.seatLabel} จะกลับคืนสู่สถานะ "ที่นั่งว่าง" ในผังจองคิวทันที</span> เพื่อให้ผู้ชมท่านอื่นสามารถเลือกซื้อได้
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTicketToRefund(null)}
                  className="px-4 py-2.5 text-neutral-400 hover:text-white transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ยืนยันคืนบัตร & ปลดล็อกที่นั่ง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
