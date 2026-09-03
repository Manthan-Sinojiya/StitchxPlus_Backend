import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Scissors, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '../components/ui';
import { loginSchema, LoginInput } from '../schemas/auth.schema';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { SEOHead } from '../components/seo/SEOHead';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setApiError(null);
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken);
        toast('success', 'Authenticated', `Welcome back, ${response.data.user.name}.`);
        navigate(from, { replace: true });
      } else {
        const errorMsg =
          response.error?.message || 'Invalid credentials. Please verify your email and password.';
        setApiError(errorMsg);
        toast('error', 'Login Failed', errorMsg);
      }
    } catch (_err) {
      setApiError('An unexpected server error occurred. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <SEOHead
        title="Sign In | Stitchx Plus LLC"
        description="Sign in to your Stitchx Plus account to access saved measurement profiles and custom order history."
      />
      <Card className="shadow-dropdown border-navy-100">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-navy-950 mx-auto shadow-gold">
            <Scissors className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl font-serif">Gentleman&apos;s Sign In</CardTitle>
          <p className="text-xs text-navy-500">
            Access your custom digital fit profiles & bespoke orders
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
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@domain.com"
                startIcon={<Mail className="w-4 h-4" />}
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-navy-800">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-gold-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-navy-600 border-t border-navy-100 pt-4">
            <span>Don&apos;t have a fit profile yet? </span>
            <Link to="/register" className="font-bold text-gold-700 hover:underline">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
