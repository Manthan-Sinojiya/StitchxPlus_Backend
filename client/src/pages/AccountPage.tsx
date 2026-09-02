import { User as UserIcon, LogOut, ShieldCheck, Mail, Package, MapPin, Heart, Ruler, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card, CardContent, Tabs, useToast } from '../components/ui';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { PatternManager } from '../components/patterns/PatternManager';
import { OrderHistorySection } from '../components/account/OrderHistorySection';
import { ProfileSection } from '../components/account/ProfileSection';
import { AddressBookSection } from '../components/account/AddressBookSection';
import { WishlistSection } from '../components/account/WishlistSection';
import { SEOHead } from '../components/seo/SEOHead';

export function AccountPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_err) {
      // Ignore logout api errors
    } finally {
      clearAuth();
      toast('info', 'Signed Out', 'You have been safely signed out.');
      navigate('/login');
    }
  };

  return (
    <>
      <SEOHead
        title="My Bespoke Account | Stitchx Plus LLC"
        description="Manage your custom menswear orders, saved measurement patterns, profile details, and address book."
      />
      <div className="space-y-6 sm:space-y-8">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-3xl p-8 text-white border border-gold-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-serif text-white">{user?.name || 'Patron'}</h1>
              <Badge variant="gold" className="uppercase font-semibold tracking-wider">
                {user?.role || 'CUSTOMER'}
              </Badge>
            </div>
            <p className="text-xs text-navy-300 mt-1 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              <span>{user?.email}</span>
              {user?.isVerified && (
                <span className="flex items-center gap-1 text-emerald-400 font-medium ml-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-white border-gold-400/40 hover:bg-gold-500/10"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Account Dashboard Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs
            items={[
              {
                id: 'orders',
                label: (
                  <span className="flex items-center gap-2">
                    <Package className="w-4 h-4" /> Bespoke Orders
                  </span>
                ),
                content: <OrderHistorySection />,
              },
              {
                id: 'profile',
                label: (
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Personal Profile
                  </span>
                ),
                content: <ProfileSection />,
              },
              {
                id: 'addresses',
                label: (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address Book
                  </span>
                ),
                content: <AddressBookSection />,
              },
              {
                id: 'patterns',
                label: (
                  <span className="flex items-center gap-2">
                    <Ruler className="w-4 h-4" /> Measurement Patterns
                  </span>
                ),
                content: (
                  <div className="pt-4">
                    <PatternManager />
                  </div>
                ),
              },
              {
                id: 'wishlist',
                label: (
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Saved Wishlist
                  </span>
                ),
                content: <WishlistSection />,
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
