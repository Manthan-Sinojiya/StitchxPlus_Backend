import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '../components/ui';
import { forgotPasswordSchema, ForgotPasswordInput } from '../schemas/auth.schema';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetTokenInfo, setResetTokenInfo] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setApiError(null);
    setSuccessMsg(null);
    setResetTokenInfo(null);

    try {
      const response = await authService.forgotPassword(data);
      if (response.success) {
        setSuccessMsg(
          'Password reset instructions have been issued. Please check your email inbox.',
        );
        if (response.data?.resetToken && response.data.resetToken !== 'if-registered-token-sent') {
          setResetTokenInfo(response.data.resetToken);
        }
        toast('info', 'Reset Request Sent', 'Instructions sent if account exists.');
      } else {
        setApiError(response.error?.message || 'Failed to process request.');
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
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-serif">Forgot Password</CardTitle>
          <p className="text-xs text-navy-500">
            Enter your registered email to receive a password reset link
          </p>
        </CardHeader>

        <CardContent>
          {successMsg && (
            <div className="mb-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reset Link Dispatched</span>
              </div>
              <p>{successMsg}</p>
              {resetTokenInfo && (
                <div className="pt-2 border-t border-emerald-200">
                  <p className="font-mono text-[11px] text-emerald-900 bg-emerald-100 p-2 rounded break-all">
                    Demo Token: {resetTokenInfo}
                  </p>
                  <Link
                    to={`/reset-password?token=${resetTokenInfo}`}
                    className="inline-block mt-2 font-bold text-emerald-950 underline hover:text-emerald-700"
                  >
                    Click to proceed to Reset Form →
                  </Link>
                </div>
              )}
            </div>
          )}

          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              startIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Instructions
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
