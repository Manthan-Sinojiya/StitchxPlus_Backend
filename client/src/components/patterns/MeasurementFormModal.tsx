import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Ruler } from 'lucide-react';
import { Modal, Button, Input, Select, useToast } from '../ui';
import { MeasurementProfile } from '@stitchx/shared';
import { patternService } from '../../services/patternService';

const patternFormSchema = z.object({
  name: z.string().min(1, 'Profile name is required').max(50, 'Max 50 characters'),
  height: z.coerce.number().min(30, 'Min 30 in').max(96, 'Max 96 in'),
  chest: z.coerce.number().min(24, 'Min 24 in').max(75, 'Max 75 in'),
  waist: z.coerce.number().min(20, 'Min 20 in').max(70, 'Max 70 in'),
  shoulder: z.coerce.number().min(10, 'Min 10 in').max(35, 'Max 35 in'),
  sleeve: z.coerce.number().min(15, 'Min 15 in').max(45, 'Max 45 in'),
  neck: z.coerce.number().min(10, 'Min 10 in').max(26, 'Max 26 in'),
  jacketLength: z.coerce.number().min(20, 'Min 20 in').max(45, 'Max 45 in'),
  trouserWaist: z.coerce.number().min(20, 'Min 20 in').max(70, 'Max 70 in'),
  inseam: z.coerce.number().min(18, 'Min 18 in').max(45, 'Max 45 in'),
  thigh: z.coerce.number().min(14, 'Min 14 in').max(40, 'Max 40 in'),
  fitPreference: z.enum(['slim', 'regular', 'relaxed']).default('regular'),
  unit: z.enum(['inches', 'cm']).default('inches'),
  isDefault: z.boolean().default(false),
});

type PatternFormData = z.infer<typeof patternFormSchema>;

interface MeasurementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patternToEdit?: MeasurementProfile | null;
  onSuccess: (pattern: MeasurementProfile) => void;
}

export function MeasurementFormModal({
  isOpen,
  onClose,
  patternToEdit,
  onSuccess,
}: MeasurementFormModalProps) {
  const { toast } = useToast();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatternFormData>({
    resolver: zodResolver(patternFormSchema),
    defaultValues: {
      name: 'My Custom Fit',
      height: 70,
      chest: 40,
      waist: 34,
      shoulder: 18,
      sleeve: 34,
      neck: 15.5,
      jacketLength: 30,
      trouserWaist: 34,
      inseam: 32,
      thigh: 24,
      fitPreference: 'regular',
      unit: 'inches',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (patternToEdit) {
      reset({
        name: patternToEdit.name,
        height: patternToEdit.height,
        chest: patternToEdit.chest,
        waist: patternToEdit.waist,
        shoulder: patternToEdit.shoulder,
        sleeve: patternToEdit.sleeve,
        neck: patternToEdit.neck,
        jacketLength: patternToEdit.jacketLength,
        trouserWaist: patternToEdit.trouserWaist,
        inseam: patternToEdit.inseam,
        thigh: patternToEdit.thigh,
        fitPreference: patternToEdit.fitPreference || 'regular',
        unit: patternToEdit.unit || 'inches',
        isDefault: patternToEdit.isDefault || false,
      });
    } else {
      reset({
        name: 'My Custom Fit',
        height: 70,
        chest: 40,
        waist: 34,
        shoulder: 18,
        sleeve: 34,
        neck: 15.5,
        jacketLength: 30,
        trouserWaist: 34,
        inseam: 32,
        thigh: 24,
        fitPreference: 'regular',
        unit: 'inches',
        isDefault: false,
      });
    }
  }, [patternToEdit, reset, isOpen]);

  const onSubmit = async (data: PatternFormData) => {
    try {
      let res;
      if (patternToEdit) {
        res = await patternService.updatePattern(patternToEdit.id, data);
      } else {
        res = await patternService.createPattern(data);
      }

      if (res.success && res.data) {
        toast('success', patternToEdit ? 'Pattern Updated' : 'Pattern Created', res.message);
        onSuccess(res.data);
        onClose();
      } else {
        toast('error', 'Error', res.error?.message || 'Failed to save measurement profile');
      }
    } catch (err: any) {
      toast('error', 'Error', err.message || 'An unexpected error occurred');
    }
  };

  const measurementTooltips: Record<string, string> = {
    chest: 'Measure around the fullest part of your chest under your arms, keeping tape parallel to ground.',
    waist: 'Measure around your natural waistline, typically around the belly button height.',
    shoulder: 'Measure across the back from the edge of shoulder point to shoulder point.',
    sleeve: 'Measure from center back of neck across shoulder to wrist with arm slightly bent.',
    neck: 'Measure around base of neck where shirt collar sits, adding 0.5 inch for comfort.',
    jacketLength: 'Measure from base of back collar down to the middle of your thumb fold.',
    trouserWaist: 'Measure around your waist at the height you comfortably wear suit trousers.',
    inseam: 'Measure along inside leg from crotch seam down to bottom of ankle/shoe top.',
    thigh: 'Measure around fullest part of upper thigh near crotch.',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patternToEdit ? 'Edit Measurement Profile' : 'Create Measurement Profile'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Profile Name (e.g. Wedding, Business)"
            {...register('name')}
            error={errors.name?.message}
            placeholder="My Standard Fit"
          />

          <Select
            label="Fit Preference"
            {...register('fitPreference')}
            error={errors.fitPreference?.message}
            options={[
              { value: 'slim', label: 'Slim Fit (Tailored Close)' },
              { value: 'regular', label: 'Regular Fit (Classic Comfort)' },
              { value: 'relaxed', label: 'Relaxed Fit (Roomy)' },
            ]}
          />
        </div>

        {/* Upper Body Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-navy-100 pb-2">
            <Ruler className="w-4 h-4 text-gold-600" />
            <h4 className="font-heading font-bold text-navy-900 text-sm">
              Jacket & Upper Body (Inches)
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(
              [
                ['height', 'Height (Total)'],
                ['chest', 'Chest Circumference'],
                ['waist', 'Natural Waist'],
                ['shoulder', 'Shoulder Width'],
                ['sleeve', 'Sleeve Length'],
                ['neck', 'Neck Collar Size'],
                ['jacketLength', 'Jacket Length'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="relative">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-navy-700 block mb-1">
                    {label}
                  </label>
                  {measurementTooltips[field] && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip(activeTooltip === field ? null : field)
                      }
                      className="text-navy-400 hover:text-gold-600 mb-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Input type="number" step="0.25" {...register(field)} error={errors[field]?.message} />
                {activeTooltip === field && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-navy-900 text-white text-[10px] p-2 rounded-lg shadow-xl">
                    {measurementTooltips[field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lower Body Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b border-navy-100 pb-2">
            <Ruler className="w-4 h-4 text-gold-600" />
            <h4 className="font-heading font-bold text-navy-900 text-sm">
              Trouser & Lower Body (Inches)
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(
              [
                ['trouserWaist', 'Trouser Waist'],
                ['inseam', 'Inseam Length'],
                ['thigh', 'Thigh Circumference'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="relative">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-navy-700 block mb-1">
                    {label}
                  </label>
                  {measurementTooltips[field] && (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveTooltip(activeTooltip === field ? null : field)
                      }
                      className="text-navy-400 hover:text-gold-600 mb-1"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Input type="number" step="0.25" {...register(field)} error={errors[field]?.message} />
                {activeTooltip === field && (
                  <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-navy-900 text-white text-[10px] p-2 rounded-lg shadow-xl">
                    {measurementTooltips[field]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" isLoading={isSubmitting}>
            {patternToEdit ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
