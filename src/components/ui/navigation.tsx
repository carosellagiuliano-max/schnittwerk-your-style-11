import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Instagram, Phone, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentBookingDialog } from '@/components/booking/appointment-booking-dialog';
import AuthDialog from '@/components/auth/AuthDialog';
import CategoryNavDialog from '@/components/booking/category-nav-dialog';
import CartDialog from '@/components/booking/cart-dialog';
import VanessaProfileDialog from '@/components/booking/vanessa-profile-dialog';
import { useCart } from '@/contexts/cart-context';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { totalItems } = useCart();

  const navItems = [
    { href: '/leistungen', label: 'Leistungen & Preise' },
    { href: '/galerie', label: 'Galerie' },
    { href: '/ueber-uns', label: 'Über uns & Kontakt' },
  ];

  return (
    <nav className="bg-gradient-to-r from-accent/95 via-card/98 to-accent/95 backdrop-blur-2xl border-b border-border/30 sticky top-0 z-50 shadow-2xl shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28 py-2">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex flex-col items-center group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-110"></div>
              <span className="text-4xl font-heading font-bold bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent group-hover:scale-105 transition-all duration-500 relative z-10">
                SCHNITTWERK
              </span>
              <span className="text-xs font-nunito text-muted-foreground tracking-[0.2em] text-center mt-1 group-hover:text-foreground group-hover:tracking-[0.25em] transition-all duration-500 relative z-10">
                BY VANESSA CAROSELLA
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-16 flex items-center space-x-8">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-foreground/90 hover:text-primary transition-all duration-500 text-lg font-semibold hover:scale-105 transform relative group px-6 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 border border-transparent hover:border-primary/20"
                  style={{ transitionDelay: `${index * 75}ms` }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-500 group-hover:w-[80%] transform -translate-x-1/2 rounded-full"></span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 shadow-lg"></span>
                </Link>
              ))}
              <VanessaProfileDialog>
                <button className="text-foreground/90 hover:text-primary transition-all duration-500 text-lg font-semibold hover:scale-105 transform relative group px-6 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 border border-transparent hover:border-primary/20 ml-4">
                  <Users className="inline w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Team</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-500 group-hover:w-[80%] transform -translate-x-1/2 rounded-full"></span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 shadow-lg"></span>
                </button>
              </VanessaProfileDialog>
              <CategoryNavDialog
                title="Shop - Kategorien"
                description="Wählen Sie eine Produktkategorie aus"
              >
                <button className="text-foreground/90 hover:text-primary transition-all duration-500 text-lg font-semibold hover:scale-105 transform relative group px-6 py-3 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 border border-transparent hover:border-primary/20 ml-4">
                  <ShoppingCart className="inline w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Shop</span>
                  <span className="absolute bottom-0 left-1/2 w-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-500 group-hover:w-[80%] transform -translate-x-1/2 rounded-full"></span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 shadow-lg"></span>
                </button>
              </CategoryNavDialog>
            </div>
          </div>

          {/* Desktop CTA & Social */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 mr-4">
              <a
                href="https://www.instagram.com/schnittwerksg?igsh=MXA1NTQzOG90OWU1dw%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="group relative text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Instagram className="h-5 w-5 group-hover:rotate-12 transition-transform duration-500" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></span>
              </a>
              <a
                href="tel:+41718019265"
                title="Telefon"
                className="group relative text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-green-500/10 hover:to-blue-500/10 hover:shadow-lg hover:shadow-green-500/20"
              >
                <Phone className="h-5 w-5 group-hover:rotate-12 transition-transform duration-500" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></span>
              </a>
              <CartDialog>
                <button className="group relative text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10 hover:shadow-lg hover:shadow-orange-500/20">
                  <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform duration-500" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce shadow-lg">
                      {totalItems}
                    </span>
                  )}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></span>
                </button>
              </CartDialog>
            </div>
            <Button 
              size="default" 
              variant="outline"
              className="bg-gradient-to-r from-transparent to-transparent border-2 border-primary/40 text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary/80 transition-all duration-500 hover:scale-105 transform hover:shadow-lg hover:shadow-primary/20 backdrop-blur-sm"
              onClick={() => setShowAuthDialog(true)}
            >
              Login
            </Button>
            <Button 
              size="default" 
              className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground hover:from-primary/90 hover:via-primary hover:to-primary/90 transition-all duration-500 hover:scale-105 transform shadow-xl hover:shadow-2xl hover:shadow-primary/30 relative overflow-hidden group"
              onClick={() => setShowAuthDialog(true)}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10">Termin buchen</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-xl text-foreground hover:text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-500 hover:scale-110 transform hover:shadow-lg relative group"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              {isOpen ? 
                <X className="h-6 w-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" /> : 
                <Menu className="h-6 w-6 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-in slide-in-from-top-5 duration-500">
          <div className="px-6 pt-6 pb-8 space-y-4 sm:px-8 bg-gradient-to-b from-accent/98 via-card/95 to-accent/98 backdrop-blur-2xl border-t border-border/20">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className="block px-6 py-4 text-lg font-semibold text-foreground/90 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-500 rounded-2xl hover:scale-105 transform relative group border border-transparent hover:border-primary/20"
                onClick={() => setIsOpen(false)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg"></span>
              </Link>
            ))}
            <VanessaProfileDialog>
              <button 
                className="block px-6 py-4 text-lg font-semibold text-foreground/90 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-500 rounded-2xl w-full text-left hover:scale-105 transform relative group border border-transparent hover:border-primary/20"
                onClick={() => setIsOpen(false)}
              >
                <Users className="inline w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Team</span>
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg"></span>
              </button>
            </VanessaProfileDialog>
            <CategoryNavDialog
              title="Shop - Kategorien"
              description="Wählen Sie eine Produktkategorie aus"
            >
              <button 
                className="block px-6 py-4 text-lg font-semibold text-foreground/90 hover:text-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-500 rounded-2xl w-full text-left hover:scale-105 transform relative group border border-transparent hover:border-primary/20"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="inline w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Shop</span>
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-lg"></span>
              </button>
            </CategoryNavDialog>
            <div className="px-6 py-4 space-y-6 border-t border-border/20 mt-6 pt-8">
              <div className="flex items-center justify-center space-x-6">
                <a
                  href="https://www.instagram.com/schnittwerksg?igsh=MXA1NTQzOG90OWU1dw%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="group text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-pink-500/10 hover:to-purple-500/10"
                >
                  <Instagram className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
                </a>
                <a
                  href="tel:+41718019265"
                  title="Telefon"
                  className="group text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-green-500/10 hover:to-blue-500/10"
                >
                  <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
                </a>
                <CartDialog>
                  <button className="group relative text-muted-foreground hover:text-primary transition-all duration-500 hover:scale-125 transform p-3 rounded-full hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-red-500/10">
                    <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform duration-500" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-bounce">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </CartDialog>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground hover:from-primary/90 hover:via-primary hover:to-primary/90 transition-all duration-500 hover:scale-105 transform shadow-lg hover:shadow-xl relative overflow-hidden group"
                onClick={() => {
                  setIsOpen(false);
                  setShowAuthDialog(true);
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10">Termin buchen</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </nav>
  );
};

export default Navigation;