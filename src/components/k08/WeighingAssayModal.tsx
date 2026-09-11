/**
 * Didar Gold Platform - Domain K08: Weighing & Metallurgical Assay Modal
 * Precise laboratory scale verification, quarantine tracking and assay testing
 */

import React, { useState } from 'react';
import { X, Scale, FlaskConical, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { IntakeShipment, AssayToleranceStatus } from '../../types/k08.js';

interface WeighingAssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IntakeShipment | null;
  onSaveWeighing: (shipmentId: string, data: any) => Promise<void>;
  onMoveQuarantine: (shipmentId: string, quarantineBinCode: string) => Promise<void>;
  onSaveAssay: (shipmentId: string, data: any) => Promise<void>;
}

export const WeighingAssayModal: React.FC<WeighingAssayModalProps> = ({
  isOpen,
  onClose,
  shipment,
  onSaveWeighing,
  onMoveQuarantine,
  onSaveAssay
}) => {
  const [activeTab, setActiveTab] = useState<'weighing' | 'quarantine' | 'assay'>(
    shipment?.status === 'registered' ? 'weighing' : shipment?.status === 'weighed' ? 'quarantine' : 'assay'
  );

  // Weighing State
  const [scaleWeightGrams, setScaleWeightGrams] = useState<number>(
    shipment?.measuredWeightGrams || shipment?.declaredWeightGrams || 500
  );
  const [scaleCalibrationSerial, setScaleCalibrationSerial] = useState(
    shipment?.scaleCalibrationSerial || 'CAL-SART-2026-X812'
  );
  const [scaleModelFa, setScaleModelFa] = useState(
    shipment?.scaleModelFa || 'ترازوی تحلیلی سارتوریوس ۴ رقم اعشار کالیبره سازمان استاندارد'
  );

  // Quarantine State
  const [quarantineBinCode, setQuarantineBinCode] = useState(
    shipment?.quarantineBinCode || 'VAULT-Q-BIN-04'
  );

  // Assay State
  const [assayMethod, setAssayMethod] = useState<'xrf_spectrometry' | 'fire_assay_cupellation' | 'ultrasound_density' | 'acid_scratch'>(
    'xrf_spectrometry'
  );
  const [testFineness, setTestFineness] = useState<number>(
    shipment?.measuredFineness || 750.1
  );
  const [standardFinenessBenchmark, setStandardFinenessBenchmark] = useState<number>(750.0);
  const [spectrometerSerial, setSpectrometerSerial] = useState('XRF-FISCHERSCOPE-G5-992');
  const [technicianName, setTechnicianName] = useState('مهندس مریم حسینیان (متالورژی)');
  const [laboratoryNameFa, setLaboratoryNameFa] = useState('آزمایشگاه عیارسنجی مرکزی دیدار گلد');
  const [densityGcm3, setDensityGcm3] = useState<number>(15.42);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !shipment) return null;

  const declaredWeight = shipment.declaredWeightGrams;
  const weightDelta = scaleWeightGrams - declaredWeight;
  const weightVariancePercent = declaredWeight > 0 ? (weightDelta / declaredWeight) * 100 : 0;
  const finenessDelta = testFineness - standardFinenessBenchmark;

  // Real-time tolerance evaluation
  let liveTolerance: AssayToleranceStatus = AssayToleranceStatus.WITHIN_STANDARD_TOLERANCE;
  let toleranceText = 'در محدوده استاندارد مجاز صنف طلا (بدون کسر)';
  let toleranceColor = 'text-[#3DD68C]';

  if (finenessDelta < -3.0) {
    liveTolerance = AssayToleranceStatus.OUT_OF_TOLERANCE_CRITICAL;
    toleranceText = 'بیش از ۳ خط زیر عیار استاندارد (مردود / ریسک بحرانی)';
    toleranceColor = 'text-[#E5484D]';
  } else if (finenessDelta < -1.0) {
    liveTolerance = AssayToleranceStatus.CONDITIONAL_TOLERANCE_FEE;
    toleranceText = '۱ تا ۳ خط زیر عیار استاندارد (پذیرش مشروط با کسر وزنی)';
    toleranceColor = 'text-[#E5A84B]';
  } else if (finenessDelta >= 0) {
    toleranceText = 'عیار دقیق یا بالاتر از ۷۵۰ (مطابق استاندارد)';
    toleranceColor = 'text-[#3DD68C]';
  }

  const handleWeighingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await onSaveWeighing(shipment.id, {
        scaleWeightGrams,
        scaleCalibrationSerial,
        scaleModelFa,
        actorName: 'کارشناس توزین تحلیلی خزانه'
      });
      setActiveTab('quarantine');
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت توزین');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuarantineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await onMoveQuarantine(shipment.id, quarantineBinCode);
      setActiveTab('assay');
    } catch (err: any) {
      setError(err.message || 'خطا در انتقال به قرنطینه');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await onSaveAssay(shipment.id, {
        assayMethod,
        sampleId: `SMP-${shipment.shipmentNumber}-01`,
        testFineness,
        standardFinenessBenchmark,
        discrepancyDelta: finenessDelta,
        toleranceStatus: liveTolerance,
        densityGcm3,
        laboratoryNameFa,
        technicianName,
        spectrometerSerial,
        notes: `آزمون به روش ${assayMethod} انجام شد. نتیجه عیار: ${testFineness}`
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت نتایج آزمون');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-[#2F2F3D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A38] mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#C8A951]/20 text-[#E5C365] font-bold">
                {shipment.shipmentNumber}
              </span>
              <h2 className="text-base font-bold text-[#F4F4F6]">کنترل فیزیکی، توزین و عیارسنجی</h2>
            </div>
            <p className="text-xs text-[#9E9EA8] mt-0.5">
              تأمین‌کننده: {shipment.supplierNameFa} | وزن اعلامی: {Number(shipment.declaredWeightGrams ?? shipment.declaredTotalWeightGrams ?? 0).toFixed(2)} گرم
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888898] hover:text-[#F4F4F6] hover:bg-[#252533] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-[#121218] border border-[#272736] rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('weighing')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'weighing'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#9E9EA8] hover:text-[#F4F4F6]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>۱. توزین آزمایشگاهی</span>
            {shipment.measuredWeightGrams && <CheckCircle2 className="w-3 h-3 text-[#141416]" />}
          </button>

          <button
            onClick={() => setActiveTab('quarantine')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quarantine'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#9E9EA8] hover:text-[#F4F4F6]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>۲. جای‌گذاری در قرنطینه</span>
            {shipment.quarantineBinCode && <CheckCircle2 className="w-3 h-3 text-[#141416]" />}
          </button>

          <button
            onClick={() => setActiveTab('assay')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assay'
                ? 'bg-[#C8A951] text-[#141416] shadow-sm'
                : 'text-[#9E9EA8] hover:text-[#F4F4F6]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>۳. آزمون متالورژی و عیار</span>
            {shipment.measuredFineness && <CheckCircle2 className="w-3 h-3 text-[#141416]" />}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs text-[#FF8B8E] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Weighing */}
        {activeTab === 'weighing' && (
          <form onSubmit={handleWeighingSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#13131A] border border-[#252533] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    وزن اندازه‌گیری‌شده روی ترازوی رسمی (گرم)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={scaleWeightGrams}
                    onChange={(e) => setScaleWeightGrams(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-sm font-mono font-bold text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none text-left"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-[#7E7E90]">دقت ترازو تا ۳ رقم اعشار (میلی‌گرم)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    سریال گواهی کالیبراسیون ترازو
                  </label>
                  <input
                    type="text"
                    required
                    value={scaleCalibrationSerial}
                    onChange={(e) => setScaleCalibrationSerial(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs font-mono text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                  مدل و برند تجهیزات سنجش وزن
                </label>
                <input
                  type="text"
                  required
                  value={scaleModelFa}
                  onChange={(e) => setScaleModelFa(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              {/* Real-time Variance Calculation */}
              <div className="p-3 rounded-lg bg-[#181822] border border-[#2B2B3C] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#9E9EA8]">مغایرت با وزن اعلامی:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-sm font-mono font-bold ${
                      Math.abs(weightDelta) <= 0.05 ? 'text-[#3DD68C]' : 'text-[#E5A84B]'
                    }`}>
                      {(weightDelta || 0) > 0 ? `+${(weightDelta || 0).toFixed(3)}` : (weightDelta || 0).toFixed(3)} گرم
                    </span>
                    <span className="text-xs text-[#7E7E90]">
                      ({(weightVariancePercent || 0).toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#A6A6B8]">آستانه تلرانس مجاز وزن:</span>
                  <p className="text-xs font-bold text-[#CECED8]">حداکثر ±۰.۰۵ گرم در هر کیلوگرم</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED]"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-xl shadow-lg transition-all"
              >
                {submitting ? 'در حال ثبت...' : 'ثبت وزن و مرحله بعد'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Quarantine */}
        {activeTab === 'quarantine' && (
          <form onSubmit={handleQuarantineSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#13131A] border border-[#252533] space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#E5A84B]/10 border border-[#E5A84B]/30 text-xs text-[#E5C365]">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>
                  کلیه محموله‌های فیزیکی تا زمان اعلام نتایج آزمایشگاه عیارسنجی، باید به صندوق قرنطینه منتقل و لاک شوند.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#CECED8] mb-1.5">
                  کد گاوصندوق / صندوقچه قرنطینه (Quarantine Bin Code)
                </label>
                <input
                  type="text"
                  required
                  value={quarantineBinCode}
                  onChange={(e) => setQuarantineBinCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#1B1B24] border border-[#303040] rounded-xl text-sm font-mono font-bold text-[#E5C365] focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
                <span className="text-[10px] text-[#7E7E90]">شناسه ردیف و قفسه امنیتی خزانه قرنطینه</span>
              </div>

              <div className="text-xs text-[#9E9EA8] space-y-1 bg-[#181822] p-3 rounded-lg border border-[#282836]">
                <p>• دسترسی به این صندوقچه تنها با احراز دو مأمور حراست و پذیرش مجاز است.</p>
                <p>• شماره بارنامه: <strong className="text-[#EDEDED]">{shipment.waybillTrackingNumber}</strong></p>
                <p>• وزن قفل‌شده: <strong className="text-[#3DD68C]">{shipment.measuredWeightGrams || shipment.declaredWeightGrams} گرم</strong></p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('weighing')}
                className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED]"
              >
                بازگشت به توزین
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-xl shadow-lg transition-all"
              >
                {submitting ? 'در حال ثبت...' : 'تأیید استقرار در قرنطینه'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Assay */}
        {activeTab === 'assay' && (
          <form onSubmit={handleAssaySubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-[#13131A] border border-[#252533] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    روش عیارسنجی متالورژیکی
                  </label>
                  <select
                    value={assayMethod}
                    onChange={(e) => setAssayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                  >
                    <option value="xrf_spectrometry">طیف‌سنجی پرتو ایکس (XRF Spectrometry) - بدون تخریب</option>
                    <option value="fire_assay_cupellation">کوپلاسیون ری‌گری (Fire Assay) - آزمون مرجع قانونی</option>
                    <option value="ultrasound_density">چگالی‌سنجی فراصوت (Ultrasound Density)</option>
                    <option value="acid_scratch">محک اسید نیتریک سنتی (Scratch Touchstone)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    دستگاه / طیف‌سنج فلورسانس
                  </label>
                  <input
                    type="text"
                    required
                    value={spectrometerSerial}
                    onChange={(e) => setSpectrometerSerial(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs font-mono text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    عیار سنجیده‌شده آزمایشگاه (ممیز)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={testFineness}
                    onChange={(e) => setTestFineness(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-sm font-mono font-bold text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    عیار معیار استاندارد
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    disabled
                    value={standardFinenessBenchmark}
                    className="w-full px-3 py-2 bg-[#17171F] border border-[#2B2B38] rounded-xl text-sm font-mono text-[#9E9EA8] text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#CECED8] mb-1">
                    چگالی ویژه (g/cm³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={densityGcm3}
                    onChange={(e) => setDensityGcm3(parseFloat(e.target.value) || 15.4)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-sm font-mono text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Tolerance Box */}
              <div className="p-3.5 rounded-xl bg-[#161620] border border-[#2D2D3E] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A6A6B8]">اختلاف عیار (Delta Fineness):</span>
                  <span className={`text-sm font-mono font-bold ${
                    finenessDelta >= 0 ? 'text-[#3DD68C]' : finenessDelta >= -1.0 ? 'text-[#E5C365]' : 'text-[#E5484D]'
                  }`}>
                    {(finenessDelta || 0) >= 0 ? `+${(finenessDelta || 0).toFixed(2)}` : (finenessDelta || 0).toFixed(2)} خط
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#888898]">وضعیت تلرانس:</span>
                  <strong className={toleranceColor}>{toleranceText}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#A6A6B8] mb-1">
                    کارشناس متالورژی آزمایشگاه
                  </label>
                  <input
                    type="text"
                    required
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#A6A6B8] mb-1">
                    نام آزمایشگاه عیارسنجی
                  </label>
                  <input
                    type="text"
                    required
                    value={laboratoryNameFa}
                    onChange={(e) => setLaboratoryNameFa(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('quarantine')}
                className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED]"
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-xl shadow-lg transition-all"
              >
                {submitting ? 'در حال ثبت...' : 'ثبت قطعی نتایج آزمون عیار'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
