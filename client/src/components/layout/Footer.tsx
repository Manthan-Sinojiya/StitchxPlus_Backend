import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowRight, Award, Truck, Check } from 'lucide-react';
import { Input, Button } from '../ui';
import { contentService, CMSFooterData } from '../../services/contentService';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [footerData, setFooterData] = useState<CMSFooterData | null>(null);

  useEffect(() => {
    contentService.getFooterContent().then((data) => {
      if (data && Array.isArray(data.columns) && data.columns.length > 0) {
        setFooterData(data);
      }
    }).catch(() => { });
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-cream-100/80 text-charcoal-800 border-t border-charcoal-200/80 pt-16 pb-12 mt-20">
      {/* Brand Value Props Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-charcoal-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-bronze-600 shrink-0 shadow-subtle">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-950 text-base">
                Hand-Crafted Precision
              </h4>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Master tailors crafting custom garments for your exact measurements.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-bronze-600 shrink-0 shadow-subtle">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-950 text-base">Perfect Fit Guarantee</h4>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Complimentary alterations or 100% remaking warranty.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center text-bronze-600 shrink-0 shadow-subtle">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-charcoal-950 text-base">
                Express Global Delivery
              </h4>
              <p className="text-xs text-charcoal-600 mt-0.5">
                Insured worldwide courier delivery straight to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal-950 flex items-center justify-center text-bronze-400">
                <Scissors className="w-4 h-4 fill-current" />
              </div>
              <span className="font-serif font-bold text-xl text-charcoal-950">
                Stitchx<span className="text-bronze-600 font-normal">Plus</span>
              </span>
            </Link>
            <p className="text-sm text-charcoal-600 max-w-sm leading-relaxed">
              Redefining luxury menswear through bespoke digital 3D customization, fine Italian
              fabrics, and precision tailoring.
            </p>

            {/* Newsletter Form */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-bronze-700">
                Join the Private Gentleman&apos;s Club
              </h5>
              {isSubscribed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Welcome! You are now subscribed to exclusive bespoke updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-white border-charcoal-200 text-charcoal-950 placeholder-charcoal-400"
                    required
                  />
                  <Button type="submit" variant="accent" size="md" className="shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Dynamic Footer Link Columns */}
          {footerData?.columns && Array.isArray(footerData.columns) && footerData.columns.length > 0 ? (
            footerData.columns.map((col, idx) => (
              <div key={col.title || idx} className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-950 font-serif">
                  {col.title}
                </h5>
                <ul className="space-y-2.5 text-sm text-charcoal-600">
                  {(col.links || []).map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.url.startsWith('http') ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-bronze-600 transition-colors">
                          {link.text}
                        </a>
                      ) : (
                        <Link to={link.url} className="hover:text-bronze-600 transition-colors">
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Quick Links Column 1 */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-950 font-serif">
                  Collections
                </h5>
                <ul className="space-y-2.5 text-sm text-charcoal-600">
                  <li>
                    <Link to="/collections?category=suits" className="hover:text-bronze-600 transition-colors">
                      Custom Suits
                    </Link>
                  </li>
                  <li>
                    <Link to="/collections?category=tuxedos" className="hover:text-bronze-600 transition-colors">
                      Black Tie Tuxedos
                    </Link>
                  </li>
                  <li>
                    <Link to="/collections?category=blazers" className="hover:text-bronze-600 transition-colors">
                      Luxury Blazers
                    </Link>
                  </li>
                  <li>
                    <Link to="/collections?category=dress-shirts" className="hover:text-bronze-600 transition-colors">
                      Bespoke Dress Shirts
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Quick Links Column 2 */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-950 font-serif">
                  Customization
                </h5>
                <ul className="space-y-2.5 text-sm text-charcoal-600">
                  <li>
                    <Link to="/customize" className="hover:text-bronze-600 transition-colors">
                      3D Suit Customizer
                    </Link>
                  </li>
                  <li>
                    <Link to="/collections" className="hover:text-bronze-600 transition-colors">
                      Fabric Selection
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Quick Links Column 3 */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-charcoal-950 font-serif">
                  Company & Policy
                </h5>
                <ul className="space-y-2.5 text-sm text-charcoal-600">
                  <li>
                    <Link to="/blog" className="hover:text-bronze-600 transition-colors">
                      Atelier Journal & Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/about" className="hover:text-bronze-600 transition-colors">
                      About Atelier
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/shipping" className="hover:text-bronze-600 transition-colors">
                      Shipping & Guarantee
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/returns" className="hover:text-bronze-600 transition-colors">
                      Returns & Alterations
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin" className="hover:text-bronze-600 transition-colors font-bold text-bronze-700">
                      Admin Portal
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-charcoal-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
        <p>&copy; {new Date().getFullYear()} Stitchx Plus LLC. All Rights Reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="/page/terms" className="hover:text-charcoal-800 transition-colors">
            Terms of Service
          </Link>
          <Link to="/page/privacy-policy" className="hover:text-charcoal-800 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
