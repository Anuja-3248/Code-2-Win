import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Wind,
  Bed,
  TrendingUp,
  Clock,
  RefreshCw,
  Sparkles,
  Ambulance,
  Radio,
  Check,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { Hospital, ResourceType, HospitalActivityLog } from '../types/hospital';
import { ApiService } from '../services/apiService';
import { StatusBadge } from '../components/StatusBadge';
import { ResourceUpdateForm } from '../components/ResourceUpdateForm';
import {
  subscribeHospitalBookings,
  acceptHospitalBooking,
  declineHospitalBooking,
  markPatientAdmitted
} from '../services/bookingService';
import type { EmergencyBooking } from '../types/booking';
import { Link } from 'react-router-dom';

interface HospitalDashboardProps {
  hospitalId?: string;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitalId = 'hosp-001',
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [logs, setLogs] = useState<HospitalActivityLog[]>([]);
  const [bookings, setBookings] = useState<EmergencyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Acceptance Dialog State
  const [selectedBookingForAccept, setSelectedBookingForAccept] = useState<EmergencyBooking | null>(null);
  const [allocatedBayInput, setAllocatedBayInput] = useState('ICU Bay 02 (Trauma Wing)');
  const [attendingDoctorInput, setAttendingDoctorInput] = useState('Dr. Arvind Sharma (Chief of Trauma)');
  const [hospitalNotesInput, setHospitalNotesInput] = useState('Critical care team scrubbed. Direct ambulance to ER Gate 2.');
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.fetchHospitalById(hospitalId);
      setHospital(data);
      const activityLogs = await ApiService.getActivityLogs();
      setLogs(activityLogs);
    } catch (e) {
      console.error('Error fetching dashboard telemetry:', e);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchDashboardData();
      }
    };
    load();

    // Subscribe to real-time hospital booking requests
    const unsubscribeBookings = subscribeHospitalBookings(hospitalId, (bookingList) => {
      if (isMounted) setBookings(bookingList);
    });

    const handleHospitalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
    window.addEventListener('resqlink-logs-updated', handleHospitalUpdate);

    return () => {
      isMounted = false;
      unsubscribeBookings();
      window.removeEventListener('resqlink-hospitals-updated', handleHospitalUpdate);
      window.removeEventListener('resqlink-logs-updated', handleHospitalUpdate);
    };
  }, [hospitalId, fetchDashboardData]);

  const handleOpenAcceptDialog = (booking: EmergencyBooking) => {
    setSelectedBookingForAccept(booking);
    setAllocatedBayInput(booking.requiredResource === 'Ventilator' ? 'Resuscitation Bay 01 (Ventilator Attached)' : 'ICU Trauma Bay 02');
  };

  const handleConfirmAcceptBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAccept) return;
    setIsProcessingBooking(true);

    try {
      await acceptHospitalBooking(selectedBookingForAccept.id, {
        allocatedBay: allocatedBayInput,
        attendingDoctor: attendingDoctorInput,
        hospitalNotes: hospitalNotesInput,
      });
      await fetchDashboardData();
      setSelectedBookingForAccept(null);
    } catch (err) {
      console.error('Failed to accept booking:', err);
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    if (window.confirm('Divert this booking request to nearby facilities?')) {
      await declineHospitalBooking(bookingId);
      await fetchDashboardData();
    }
  };

  const handleMarkBookingAdmitted = async (bookingId: string) => {
    await markPatientAdmitted(bookingId);
    await fetchDashboardData();
  };

  const handleUpdateAvailability = async (resourceType: ResourceType, count: number): Promise<boolean> => {
    if (!hospital) return false;
    const res = await ApiService.updateAvailability(hospital.id, {
      resourceType,
      availableCount: count,
      updatedBy: 'Dr. ER Chief Operations',
    });
    if (res.success && res.hospital) {
      setHospital(res.hospital);
      const newLogs = await ApiService.getActivityLogs();
      setLogs(newLogs);
      return true;
    }
    return false;
  };

  const handleSaveFullTelemetry = async (payload: any): Promise<boolean> => {
    if (!hospital) return false;
    const res = await ApiService.saveFullHospitalTelemetry(hospital.id, payload);
    if (res.success && res.hospital) {
      setHospital(res.hospital);
      const newLogs = await ApiService.getActivityLogs();
      setLogs(newLogs);
      return true;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="container-responsive" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <RefreshCw size={28} className="status-dot-pulse" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading hospital resource telemetry...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="container-responsive" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Hospital Telemetry Unavailable
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Unable to locate live resource data for facility ID: {hospitalId}.
        </p>
        <button
          type="button"
          onClick={() => {
            fetchDashboardData();
          }}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Reset Telemetry & Reload
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-responsive">
        {/* Top Operational Status Header */}
        <div
          className="reveal-slide-down"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800 }}>
                Hospital Resource Dashboard
              </h1>
              <StatusBadge status={hospital.status} size="md" />
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Keep your emergency resource availability up to date for dispatching ambulances.
            </p>
          </div>

          {/* Facility & Last Updated Badge - 3D Glass */}
          <div
            className="resq-card"
            style={{
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              border: '1.5px solid rgba(186, 230, 253, 0.8)',
              boxShadow: 'var(--shadow-3d)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, color: 'var(--text-navy)', fontSize: '0.985rem' }}>
                {hospital.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={13} style={{ color: 'var(--royal-600)' }} />
                Last synchronized: <strong>{hospital.lastUpdated}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchDashboardData}
              className="btn btn-secondary btn-sm"
              title="Refresh telemetry"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Live Inbound Booking Requests & Pre-Alerts Radar - 3D Glass Panel */}
        <div
          className="resq-card reveal-slide-up delay-100"
          style={{
            backgroundColor: bookings.some((b) => b.status === 'PENDING')
              ? 'rgba(255, 251, 235, 0.95)'
              : bookings.some((b) => b.status === 'ACCEPTED')
              ? 'rgba(240, 253, 244, 0.95)'
              : 'rgba(255, 255, 255, 0.88)',
            border: `1.5px solid ${
              bookings.some((b) => b.status === 'PENDING')
                ? '#F59E0B'
                : bookings.some((b) => b.status === 'ACCEPTED')
                ? '#10B981'
                : 'rgba(186, 230, 253, 0.8)'
            }`,
            padding: '1.75rem',
            marginBottom: '2.25rem',
            boxShadow: bookings.some((b) => b.status === 'PENDING')
              ? '0 12px 32px rgba(245, 158, 11, 0.18)'
              : 'var(--shadow-3d)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  backgroundColor: bookings.some((b) => b.status === 'PENDING') ? '#F59E0B' : 'var(--royal-600)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)',
                }}
              >
                <Radio size={22} className="status-dot-pulse" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-navy)' }}>
                    Inbound Hospital Emergency Bookings
                  </h3>
                  <span className="badge badge-emergency" style={{ fontSize: '0.72rem' }}>
                    Live Radar
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Review, accept and allocate emergency trauma bays for approaching ambulances in real-time.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                className={bookings.some((b) => b.status === 'PENDING') ? 'badge badge-warning' : 'badge badge-teal'}
                style={{ fontSize: '0.8rem' }}
              >
                {bookings.filter((b) => b.status === 'PENDING').length} Pending Action
              </span>
              <span
                className="badge badge-success"
                style={{ fontSize: '0.8rem' }}
              >
                {bookings.filter((b) => b.status === 'ACCEPTED').length} Confirmed In-Route
              </span>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div style={{ padding: '1.15rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', backgroundColor: 'rgba(240, 249, 255, 0.6)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(147, 197, 253, 0.8)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#059669" />
              <span>ER Triage Radar Clear — No emergency ambulance booking requests currently pending for this hospital.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => {
                const isPending = booking.status === 'PENDING';
                const isAccepted = booking.status === 'ACCEPTED';
                const isAdmitted = booking.status === 'ADMITTED';
                const isDeclined = booking.status === 'DECLINED';

                return (
                  <div
                    key={booking.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: `1.5px solid ${
                        isPending ? '#F59E0B' : isAccepted ? '#10B981' : isDeclined ? '#EF4444' : '#94A3B8'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem 1.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      boxShadow: isPending ? '0 4px 14px rgba(245, 158, 11, 0.12)' : 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '300px' }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '10px',
                          backgroundColor: isPending ? '#FEF3C7' : isAccepted ? '#D1FAE5' : '#F1F5F9',
                          color: isPending ? '#B45309' : isAccepted ? '#047857' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '1.2rem',
                          fontWeight: 800,
                        }}
                      >
                        <Ambulance size={24} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-navy)' }}>
                            {booking.patientName} (Age {booking.patientAge} • {booking.patientGender})
                          </strong>

                          <span
                            style={{
                              backgroundColor: booking.urgencyLevel === 'Critical' ? '#fee2e2' : '#fef3c7',
                              color: booking.urgencyLevel === 'Critical' ? '#dc2626' : '#b45309',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: '1px solid currentColor',
                            }}
                          >
                            ⚠️ {booking.urgencyLevel} Urgency
                          </span>

                          <span
                            style={{
                              backgroundColor: isPending ? '#FEF3C7' : isAccepted ? '#ECFDF5' : '#F1F5F9',
                              color: isPending ? '#92400E' : isAccepted ? '#065F46' : '#64748B',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              border: '1px solid currentColor',
                            }}
                          >
                            {isPending ? '🟡 PENDING ER CONFIRMATION' : isAccepted ? '🟢 CONFIRMED & ALLOCATED' : isAdmitted ? '🔵 ADMITTED' : '🔴 DECLINED'}
                          </span>

                          <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 800, marginLeft: 'auto' }}>
                            ETA: ~{Math.round(booking.etaMinutes)} Mins ({booking.distanceKm.toFixed(1)} km away)
                          </span>
                        </div>

                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Requested Resource: <strong style={{ color: 'var(--royal-700)' }}>{booking.quantity}x {booking.requiredResource} Bed</strong> • Unit: <strong>{booking.ambulanceId}</strong> ({booking.vehicleNumber}) • Driver: <strong>{booking.driverName}</strong> (<a href={`tel:${booking.driverPhone}`} style={{ color: 'var(--royal-600)', textDecoration: 'none' }}>{booking.driverPhone}</a>)
                        </div>

                        {booking.patientCondition && (
                          <div style={{ fontSize: '0.825rem', color: '#475569', marginTop: '3px', fontStyle: 'italic', backgroundColor: 'rgba(240, 249, 255, 0.7)', padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid var(--royal-600)' }}>
                            Field Notes: "{booking.patientCondition}"
                          </div>
                        )}

                        {isAccepted && (
                          <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 700, marginTop: '5px' }}>
                            🎯 Allocated: <strong>{booking.allocatedBay}</strong> • Assigned: <strong>{booking.attendingDoctor}</strong>
                          </div>
                        )}

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'monospace' }}>
                          Booking ID: {booking.id} • Transmitted at {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Hospital Staff */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAcceptDialog(booking)}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#10B981',
                              backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.825rem',
                              padding: '0.5rem 1rem',
                              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                              gap: '5px',
                            }}
                          >
                            <Check size={15} />
                            Accept & Allocate Bay
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeclineBooking(booking.id)}
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: '0.8rem', color: '#DC2626', borderColor: '#FCA5A5' }}
                          >
                            <X size={14} />
                            Decline / Divert
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => handleMarkBookingAdmitted(booking.id)}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: '0.825rem', gap: '5px' }}
                        >
                          <CheckCircle2 size={15} />
                          Mark Patient Admitted
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4 Clean Resource Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Card 1: ICU Beds */}
          <div className="resq-card reveal-slide-up stagger-1" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>ICU Beds</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                Telemetry Live
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.icuAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.icuTotal} available
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedIcuAvailable30Min} beds</strong></span>
            </div>
          </div>

          {/* Card 2: Ventilators */}
          <div className="resq-card reveal-slide-up stagger-2" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wind size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Ventilators</h3>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.725rem' }}>
                Mechanical
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.ventilatorsAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.ventilatorsTotal} ready
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedVentilatorsAvailable30Min || Math.max(0, hospital.ventilatorsAvailable - 1)} units</strong></span>
            </div>
          </div>

          {/* Card 3: General Beds */}
          <div className="resq-card reveal-slide-up stagger-3" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bed size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>General Beds</h3>
              </div>
              <span className="badge badge-teal" style={{ fontSize: '0.725rem' }}>
                Ward
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1e7e48', lineHeight: 1 }}>
                {hospital.generalBedsAvailable}
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                / {hospital.generalBedsTotal} vacant
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <Sparkles size={12} style={{ color: 'var(--primary)' }} />
              <span>Predicted in 30 min: <strong>~{hospital.predictedGeneralBedsAvailable30Min || Math.max(0, hospital.generalBedsAvailable - 2)} beds</strong></span>
            </div>
          </div>

          {/* Card 4: Emergency Capacity & Occupancy */}
          <div className="resq-card reveal-slide-up stagger-4" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Emergency Capacity</h3>
              </div>
              <span className={`badge ${hospital.occupancyRate > 80 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.725rem' }}>
                {hospital.occupancyRate > 80 ? 'High' : 'Optimal'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: hospital.occupancyRate > 80 ? '#b37e17' : 'var(--text-main)', lineHeight: 1 }}>
                {hospital.occupancyRate}%
              </span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                current occupancy
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <span>Recent 30m flow: <strong>+{hospital.admissionsLast30Min} in / -{hospital.dischargesLast30Min} out</strong></span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Update Resource Form & Recent Activity Timeline */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Update Resource Section */}
          <div className="reveal-slide-right delay-200">
            <ResourceUpdateForm
              hospital={hospital}
              onUpdate={handleUpdateAvailability}
              onSaveFullTelemetry={handleSaveFullTelemetry}
            />

            {/* Test Link to Ambulance search */}
            <div
              className="resq-card"
              style={{
                marginTop: '1.25rem',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Ambulance size={20} style={{ color: 'var(--primary)' }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong style={{ color: 'var(--primary)' }}>Test Dispatch Allocation</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    Verify how emergency ambulances see this hospital in search results.
                  </div>
                </div>
              </div>
              <Link to="/ambulance" className="btn btn-primary btn-sm">
                Open Ambulance Portal
              </Link>
            </div>
          </div>

          {/* Right Column: Recent Activity Timeline */}
          <div className="resq-card reveal-slide-left delay-200" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Recent Updates & Audits</h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Real-time log
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    position: 'relative',
                  }}
                >
                  {/* Timeline icon dot */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {log.resourceType === 'ICU' ? (
                      <Activity size={13} />
                    ) : log.resourceType === 'Ventilator' ? (
                      <Wind size={13} />
                    ) : (
                      <Bed size={13} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {log.timeFormatted}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {log.details}
                    </p>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Updated by: {log.updatedBy}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Accept & Bay Allocation Modal */}
      {selectedBookingForAccept && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 25, 47, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={() => setSelectedBookingForAccept(null)}
        >
          <div
            className="resq-card"
            style={{
              width: '100%',
              maxWidth: 560,
              padding: '2.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              boxShadow: '0 25px 60px -10px rgba(5, 14, 29, 0.45), inset 0 1.5px 1px #ffffff',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              borderRadius: 'var(--radius-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-navy)', margin: 0 }}>
                    Accept & Allocate Bay
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Confirm emergency intake for Ref #{selectedBookingForAccept.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBookingForAccept(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Inbound Booking Patient Summary */}
            <div
              style={{
                backgroundColor: 'rgba(240, 249, 255, 0.75)',
                border: '1px solid rgba(186, 230, 253, 0.8)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Patient: <strong style={{ color: 'var(--text-navy)' }}>{selectedBookingForAccept.patientName}</strong> (Age {selectedBookingForAccept.patientAge})</span>
                <span className="badge badge-emergency" style={{ fontSize: '0.72rem' }}>{selectedBookingForAccept.urgencyLevel} Priority</span>
              </div>
              <div>
                Approaching Unit: <strong>{selectedBookingForAccept.ambulanceId}</strong> ({selectedBookingForAccept.vehicleNumber}) • ETA: <strong>{Math.round(selectedBookingForAccept.etaMinutes)} min</strong>
              </div>
              <div style={{ marginTop: '4px', color: 'var(--royal-700)', fontWeight: 700 }}>
                Resource Requested: {selectedBookingForAccept.quantity}x {selectedBookingForAccept.requiredResource} Bed
              </div>
            </div>

            <form onSubmit={handleConfirmAcceptBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-navy)', marginBottom: '0.35rem' }}>
                  Assign Room / Bay Number
                </label>
                <input
                  type="text"
                  required
                  value={allocatedBayInput}
                  onChange={(e) => setAllocatedBayInput(e.target.value)}
                  className="input-field"
                  placeholder="e.g. ICU Bay 03 (Trauma Critical Wing)"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-navy)', marginBottom: '0.35rem' }}>
                  Attending Emergency Doctor / Lead Officer
                </label>
                <input
                  type="text"
                  required
                  value={attendingDoctorInput}
                  onChange={(e) => setAttendingDoctorInput(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Dr. Arvind Sharma (Chief of Trauma)"
                  style={{ width: '100%', padding: '0.65rem 0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-navy)', marginBottom: '0.35rem' }}>
                  Instructions for Paramedic Team
                </label>
                <textarea
                  rows={2}
                  value={hospitalNotesInput}
                  onChange={(e) => setHospitalNotesInput(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Bring patient directly to ER Gate 2. Resuscitation team is standing by."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForAccept(null)}
                  disabled={isProcessingBooking}
                  className="btn btn-outline"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessingBooking}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#10B981',
                    backgroundImage: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                    gap: '6px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  {isProcessingBooking ? 'Confirming...' : 'Confirm Acceptance & Reserve Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
