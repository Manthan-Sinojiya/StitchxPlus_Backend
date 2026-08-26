import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '../components/ui';
import { resetPasswordSchema, ResetPasswordInput } from '../schemas/auth.schema';
import { authService } from '../services/authService';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);

  const tokenParam = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenParam,
    },
  });

  useEffect(() => {
    if (tokenParam) {
      setValue('token', tokenParam);
    }
  }, [tokenParam, setValue]);

  const onSubmit = async (data: ResetPasswordInput) => {
    setApiError(null);
    try {
      const response = await authService.resetPassword(data);
      if (response.success) {
        toast('success', 'Password Updated', 'Your password has been updated successfully.');
        navigate('/login');
      } else {
        setApiError(response.error?.message || 'Invalid or expired reset token.');
      }
    } catch (_err) {
      setApiError('An unexpected server error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card className="shadow-dropdown border-navy-100">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-navy-950 mx-auto shadow-gold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
          <p className="text-xs text-navy-500">
            Set a new secure password for your bespoke account
          </p>
        </CardHeader>

        <CardContent>
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Reset Token"
              placeholder="Paste token if not in URL"
              {...register('token')}
              error={errors.token?.message}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              startIcon={<Lock className="w-4 h-4" />}
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              startIcon={<Lock className="w-4 h-4" />}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-navy-600 border-t border-navy-100 pt-4">
            <Link to="/login" className="font-bold text-gold-700 hover:underline">
              ← Return to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
