import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Calendar, Check, Edit2, Lock, ShieldCheck } from 'lucide-react';
import { Button, Input, useToast } from '../ui';
import { useAuthStore } from '../../store/useAuthStore';
import { userService } from '../../services/userService';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfileSection() {
  const { user, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setSaving(true);
      const updated = await userService.updateProfile(data);
      if (user) {
        setAuth({ ...user, name: updated.name, phone: updated.phone }, localStorage.getItem('token') || '');
      }
      toast('success', 'Profile Updated', 'Your personal details have been updated successfully.');
      setIsEditing(false);
    } catch (_err) {
      toast('error', 'Update Failed', 'Unable to update profile details.');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setSavingPassword(true);
      await userService.changePassword(data.currentPassword, data.newPassword);
      toast('success', 'Password Updated', 'Your password has been changed successfully.');
      setIsChangingPassword(false);
      resetPasswordForm();
    } catch (err: any) {
      toast('error', 'Password Update Failed', err.message || 'Current password may be incorrect.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8 pt-2">
      {/* Personal Details */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-navy-900">Personal Details</h3>
            <p className="text-xs text-navy-600">Manage your profile information and contact details.</p>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Details
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-cream-50/50 border border-navy-100 rounded-2xl space-y-4">
            <Input
              label="Full Name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Your full name"
            />

            <Input
              label="Phone Number"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+1 212 555 0100"
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="gold" size="sm" isLoading={saving} leftIcon={<Check className="w-4 h-4" />}>
                Save Profile
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-navy-50/50 rounded-2xl border border-navy-100/80 space-y-1">
              <span className="text-xs text-navy-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold-600" /> Full Name
              </span>
              <span className="text-base font-semibold text-navy-900 block">{user?.name}</span>
            </div>

            <div className="p-5 bg-navy-50/50 rounded-2xl border border-navy-100/80 space-y-1">
              <span className="text-xs text-navy-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-600" /> Email Address
              </span>
              <span className="text-base font-semibold text-navy-900 block">{user?.email}</span>
            </div>

            <div className="p-5 bg-navy-50/50 rounded-2xl border border-navy-100/80 space-y-1">
              <span className="text-xs text-navy-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold-600" /> Phone Number
              </span>
              <span className="text-base font-semibold text-navy-900 block">
                {user?.phone || 'Not provided'}
              </span>
            </div>

            <div className="p-5 bg-navy-50/50 rounded-2xl border border-navy-100/80 space-y-1">
              <span className="text-xs text-navy-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gold-600" /> Account Status
              </span>
              <span className="text-base font-semibold text-navy-900 block">
                {user?.isVerified ? 'Verified Patron' : 'Active Account'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Security & Password Management */}
      <div className="space-y-4 border-t border-navy-100 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gold-600" /> Security & Password
            </h3>
            <p className="text-xs text-navy-600">Update your account security credentials.</p>
          </div>
          {!isChangingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Update Password
            </Button>
          )}
        </div>

        {isChangingPassword && (
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="p-6 bg-cream-50/50 border border-navy-100 rounded-2xl space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              startIcon={<Lock className="w-4 h-4" />}
              {...registerPassword('currentPassword')}
              error={passwordErrors.currentPassword?.message}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="•••••••• (min 6 characters)"
              startIcon={<Lock className="w-4 h-4" />}
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              startIcon={<Lock className="w-4 h-4" />}
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="gold" size="sm" isLoading={savingPassword} leftIcon={<Check className="w-4 h-4" />}>
                Save New Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangingPassword(false);
                  resetPasswordForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
