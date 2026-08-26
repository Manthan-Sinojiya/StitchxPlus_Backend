import { Link } from 'react-router-dom';
import { Scissors, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="py-20 text-center space-y-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-3xl bg-navy-950 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto shadow-gold">
        <Scissors className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-6xl font-bold font-heading text-navy-900">404</h1>
        <h2 className="text-2xl font-bold font-heading text-navy-900">Garment Pattern Not Found</h2>
        <p className="text-sm text-navy-500 leading-relaxed">
          The page or custom menswear specification you are seeking does not exist or has been
          relocated.
        </p>
      </div>
      <Link to="/" className="inline-block pt-2">
        <Button variant="gold" leftIcon={<Home className="w-4 h-4" />}>
          Return to Atelier Home
        </Button>
      </Link>
    </div>
  );
}
