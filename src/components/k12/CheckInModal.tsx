/**
 * Didar Gold Platform - Kernel Domain K12
 * CheckInModal: Field GPS Geofence Check-in verification
 */

import React, { useState } from 'react';
import {
  X,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Store,
  Clock,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { FieldVisit } from '../../types/k12.js';

interface CheckInModalProps {
  visit: FieldVisit | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCheckIn: (visitId: string, lat: number, lng: number, distanceMeters: number) => Promise<void>;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visit,
  isOpen,
  onClose,
  onConfirmCheckIn
}) => {
  const [simulatedDistanceMeters, setSimulatedDistanceMeters] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !visit) return null;

  const geofenceMaxRadius = 75; // meters
  const isWithinGeofence = simulatedDistanceMeters <= geofenceMaxRadius;

  const handleCheckIn = async () => {
    setErrorMsg('');
    if (!isWithinGeofence) {
      setErrorMsg(`فاصله از طلافروشی (${simulatedDistanceMeters} متر) بیشتر از شعاع مجاز ژئوفنسینگ (${geofenceMaxRadius} متر) است.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmCheckIn(
        visit.id,
        visit.retailerLat,
        visit.retailerLng,
        simulatedDistanceMeters
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت حضور');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-md bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ثبت ورود و تطابق ژئوفنسینگ (Check-in)</h2>
              <p className="text-xs text-[#A0A0B5]">
                احراز حضور فیزیکی مأمور با مختصات ماهواره‌ای GPS گالری
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {/* Destination Details */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#E5C365]" />
                {visit.retailerTradeNameFa}
              </span>
              <span className="font-mono text-[11px] text-[#A0A0B5]">{visit.visitCode}</span>
            </div>
            <p className="text-[#A0A0B5]">صاحب پروانه: <strong className="text-[#EDEDED]">{visit.retailerOwnerFa}</strong></p>
            <p className="text-[#828299] text-[11px]">📍 {visit.retailerAddressFa}</p>
          </div>

          {/* GPS Geofence Radar Box */}
          <div className="p-4 rounded-xl border border-[#28283C] bg-[#161622] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A0A0B5] flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#C8A951] animate-pulse" />
                فاصله سنجش‌شده از ورودی فروشگاه:
              </span>
              <span className="font-mono font-bold text-white text-sm">
                {simulatedDistanceMeters} متر
              </span>
            </div>

            {/* Slider to adjust distance simulation */}
            <div className="space-y-1">
              <input
                type="range"
                min={2}
                max={150}
                value={simulatedDistanceMeters}
                onChange={e => setSimulatedDistanceMeters(Number(e.target.value))}
                className="w-full accent-[#C8A951] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#828299]">
                <span>داخل فروشگاه (۲ متر)</span>
                <span>شعاع مجاز ({geofenceMaxRadius} متر)</span>
                <span>خارج از محدوده (۱۵۰ متر)</span>
              </div>
            </div>

            {/* Geofence Status Badge */}
            <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              isWithinGeofence
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30'
            }`}>
              <span className="flex items-center gap-1.5">
                {isWithinGeofence ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                )}
                {isWithinGeofence ? 'موقعیت مکانی معتبر و منطبق بر ژئوفنس' : 'هشدار: مأمور خارج از حریم طلافروشی است'}
              </span>
              <span className="font-bold text-[11px]">
                {isWithinGeofence ? 'تأیید GPS' : 'غیرمجاز'}
              </span>
            </div>
          </div>

          {/* Time & Agent */}
          <div className="flex items-center justify-between text-xs text-[#A0A0B5] px-1">
            <span>مأمور اعزامی: <strong className="text-white">{visit.agentNameFa}</strong></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C8A951]" />
              زمان ثبت: اکنون
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={isSubmitting || !isWithinGeofence}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'تأیید ورود و آغاز جلسه'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
