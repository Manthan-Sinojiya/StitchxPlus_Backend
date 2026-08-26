import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ruler,
  Plus,
  Star,
  Copy,
  Edit3,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button, Badge, Card, useToast } from '../ui';
import { MeasurementProfile } from '@stitchx/shared';
import { patternService } from '../../services/patternService';
import { MeasurementFormModal } from './MeasurementFormModal';

export function PatternManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patternToEdit, setPatternToEdit] = useState<MeasurementProfile | null>(null);

  // Fetch Patterns
  const { data: patternsRes, isLoading } = useQuery({
    queryKey: ['measurementPatterns'],
    queryFn: async () => {
      const res = await patternService.getPatterns();
      if (!res.success) throw new Error(res.error?.message || 'Failed to fetch patterns');
      return res.data || [];
    },
  });

  const patterns = patternsRes || [];

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await patternService.deletePattern(id);
      if (!res.success) throw new Error(res.error?.message || 'Delete failed');
    },
    onSuccess: () => {
      toast('success', 'Deleted', 'Measurement pattern removed successfully');
      queryClient.invalidateQueries({ queryKey: ['measurementPatterns'] });
    },
    onError: (err: any) => {
      toast('error', 'Error', err.message || 'Failed to delete pattern');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await patternService.duplicatePattern(id);
      if (!res.success) throw new Error(res.error?.message || 'Duplicate failed');
      return res.data;
    },
    onSuccess: (data) => {
      toast('success', 'Duplicated', `Created "${data?.name}"`);
      queryClient.invalidateQueries({ queryKey: ['measurementPatterns'] });
    },
    onError: (err: any) => {
      toast('error', 'Error', err.message || 'Failed to duplicate pattern');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await patternService.setDefaultPattern(id);
      if (!res.success) throw new Error(res.error?.message || 'Update failed');
      return res.data;
    },
    onSuccess: (data) => {
      toast('success', 'Default Updated', `"${data?.name}" is now your default profile`);
      queryClient.invalidateQueries({ queryKey: ['measurementPatterns'] });
    },
  });

  const handleOpenCreate = () => {
    setPatternToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pattern: MeasurementProfile) => {
    setPatternToEdit(pattern);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-navy-900 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-gold-600" />
            <span>My Measurement Patterns</span>
          </h2>
          <p className="text-xs text-navy-500 mt-1">
            Manage your custom tailored fitting profiles for instant 1-click bespoke suit creation.
          </p>
        </div>

        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Measurement Pattern
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-navy-100 rounded-3xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && patterns.length === 0 && (
        <div className="bg-white border border-navy-100 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-navy-900 text-lg">
            No Measurement Patterns Saved
          </h3>
          <p className="text-xs text-navy-500 max-w-md mx-auto">
            Create your first custom fit profile to enjoy personalized garment tailoring.
          </p>
          <Button variant="navy" size="sm" onClick={handleOpenCreate}>
            Create First Profile
          </Button>
        </div>
      )}

      {/* Patterns Grid */}
      {!isLoading && patterns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((p) => (
            <Card
              key={p.id}
              className={`p-6 space-y-4 relative transition-all ${
                p.isDefault ? 'border-2 border-gold-500 shadow-md' : 'border border-navy-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-navy-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-navy-900 text-lg">{p.name}</h3>
                    {p.isDefault && (
                      <Badge variant="gold" size="sm">
                        Default Fit
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-navy-500 capitalize block">
                    {p.fitPreference} Fit • {p.unit || 'inches'}
                  </span>
                </div>

                {!p.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultMutation.mutate(p.id)}
                    className="text-navy-400 hover:text-gold-600 p-1 transition-colors"
                    title="Set as Default"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Measurement Specs Summary */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-navy-50/50 p-3 rounded-2xl">
                <div>
                  <span className="text-navy-400 text-[10px] block">Chest</span>
                  <span className="font-bold text-navy-900">{p.chest}"</span>
                </div>
                <div>
                  <span className="text-navy-400 text-[10px] block">Waist</span>
                  <span className="font-bold text-navy-900">{p.waist}"</span>
                </div>
                <div>
                  <span className="text-navy-400 text-[10px] block">Inseam</span>
                  <span className="font-bold text-navy-900">{p.inseam}"</span>
                </div>
                <div>
                  <span className="text-navy-400 text-[10px] block">Sleeve</span>
                  <span className="font-bold text-navy-900">{p.sleeve}"</span>
                </div>
                <div>
                  <span className="text-navy-400 text-[10px] block">Shoulder</span>
                  <span className="font-bold text-navy-900">{p.shoulder}"</span>
                </div>
                <div>
                  <span className="text-navy-400 text-[10px] block">Jacket Lgth</span>
                  <span className="font-bold text-navy-900">{p.jacketLength}"</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(p)}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateMutation.mutate(p.id)}
                    leftIcon={<Copy className="w-3.5 h-3.5" />}
                  >
                    Duplicate
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                      deleteMutation.mutate(p.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors"
                  title="Delete Pattern"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <MeasurementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patternToEdit={patternToEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['measurementPatterns'] });
        }}
      />
    </div>
  );
}
