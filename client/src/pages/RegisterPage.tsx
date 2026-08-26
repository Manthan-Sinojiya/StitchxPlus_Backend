import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  useToast,
} from '../components/ui';
import { registerSchema, RegisterInput } from '../schemas/auth.schema';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { SEOHead } from '../components/seo/SEOHead';

export function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null);
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.accessToken);
        toast(
          'success',
          'Account Created',
          'Welcome to Stitchx Plus! Your fit profile has been initialized.',
        );
        navigate('/account');
      } else {
        const errorMsg =
          response.error?.message || 'Registration failed. Please check your information.';
        setApiError(errorMsg);
        toast('error', 'Registration Error', errorMsg);
      }
    } catch (_err) {
      setApiError('An unexpected server error occurred during registration.');
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <SEOHead
        title="Create Bespoke Profile | Stitchx Plus LLC"
        description="Join Stitchx Plus for tailor-made custom menswear, saved measurement patterns, and 3D suit customization."
      />
      <Card className="shadow-dropdown border-navy-100">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center text-navy-950 mx-auto shadow-gold">
            <ShieldCheck className="w-6 h-6 fill-current" />
          </div>
          <CardTitle className="text-2xl font-serif">Create Bespoke Profile</CardTitle>
          <p className="text-xs text-navy-500">
            Join Stitchx Plus for tailor-made menswear & personalized styling
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
              label="Full Name"
              placeholder="Lord Henry Wotton"
              startIcon={<User className="w-4 h-4" />}
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="henry@domain.com"
              startIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number (Optional)"
                placeholder="+1 (555) 000-0000"
                startIcon={<Phone className="w-4 h-4" />}
                {...register('phone')}
                error={errors.phone?.message}
              />

              <Select
                label="Account Role"
                options={[
                  { value: 'CUSTOMER', label: 'Customer' },
                  { value: 'STAFF', label: 'Master Tailor (Staff)' },
                  { value: 'ADMIN', label: 'Administrator' },
                ]}
                {...register('role')}
                error={errors.role?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-navy-600 border-t border-navy-100 pt-4">
            <span>Already have an account? </span>
            <Link to="/login" className="font-bold text-gold-700 hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
