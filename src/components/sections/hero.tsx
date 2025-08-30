import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Star, Calendar, ShoppingBag, Repeat } from 'lucide-react';
import { AppointmentBookingDialog } from '@/components/booking/appointment-booking-dialog';
import { EnterpriseBookingDialog } from '@/components/booking/enterprise-booking-dialog';
import ProductsDialog from '@/components/booking/products-dialog';
import OpeningHoursDialog from '@/components/ui/opening-hours-dialog';
import AuthDialog from '@/components/auth/AuthDialog';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/salon-hero.jpg';

const Hero = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Enhanced Effects */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105 transition-transform duration-[10s] ease-out"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/50 to-primary/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20"></div>
        {/* Animated overlay patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-white rounded-full blur-2xl animate-pulse [animation-delay:2s]"></div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="space-y-8">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <h1 className="text-7xl md:text-9xl font-heading font-bold leading-tight text-white drop-shadow-2xl group-hover:scale-105 transition-transform duration-1000">
                  <span className="bg-gradient-to-r from-white via-white/95 to-white bg-clip-text text-transparent">
                    SCHNITTWERK
                  </span>
                </h1>
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-1.5 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full animate-pulse"></div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              </div>
              <p className="text-xl md:text-3xl font-nunito text-white/90 tracking-[0.3em] text-center mt-8 font-light animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500">
                BY VANESSA CAROSELLA
              </p>
            </div>
            <div className="relative animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-700">
              <p className="text-4xl md:text-5xl font-heading font-medium text-white/95 drop-shadow-xl relative">
                <span className="bg-gradient-to-r from-white via-white/90 to-white bg-clip-text text-transparent">
                  Dein Look. Dein Schnittwerk.
                </span>
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full animate-pulse [animation-delay:1s]"></div>
            </div>
            <p className="text-xl md:text-2xl text-white/85 max-w-4xl mx-auto leading-relaxed font-light drop-shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-1000">
              Moderner Premium-Coiffeur im Silberturm St. Gallen für Damen und Herren. 
              Hochwertige Behandlungen mit Trinity Haircare Produkten.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1200">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Rorschacherstrasse+152,+9000+St.+Gallen"
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/10 relative overflow-hidden"
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-white/20 to-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <MapPin className="h-10 w-10 text-white group-hover:text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <h3 className="font-heading font-bold text-2xl mb-4 text-center group-hover:text-white transition-colors duration-500">Standort</h3>
                <p className="text-white/90 text-center leading-relaxed group-hover:text-white transition-colors duration-500">
                  <span className="block font-semibold text-lg">Rorschacherstrasse 152</span>
                  <span className="block text-lg">9000 St. Gallen</span>
                  <span className="block text-sm text-white/70 mt-3 group-hover:text-white/80 transition-colors duration-500">Silberturm</span>
                </p>
              </div>
            </a>
            
            <OpeningHoursDialog>
              <div className="group block bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/10 relative overflow-hidden">
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-white/20 to-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500 shadow-lg">
                    <Clock className="h-10 w-10 text-white group-hover:text-white group-hover:rotate-12 transition-transform duration-500" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl mb-4 text-center group-hover:text-white transition-colors duration-500">Öffnungszeiten</h3>
                  <p className="text-white/90 text-center leading-relaxed group-hover:text-white transition-colors duration-500">
                    <span className="block text-lg">Mo-Di, Do-Fr: 09:00-18:30</span>
                    <span className="block text-lg">Sa: 09:00-15:00</span>
                    <span className="block text-sm text-white/70 mt-3 group-hover:text-white/80 transition-colors duration-500">Mi + So geschlossen</span>
                  </p>
                </div>
              </div>
            </OpeningHoursDialog>
            
            <Link 
              to="/leistungen"
              className="group block bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/10 relative overflow-hidden"
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-white/20 to-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-500 shadow-lg">
                  <Star className="h-10 w-10 text-white group-hover:text-white group-hover:rotate-12 transition-transform duration-500" />
                </div>
                <h3 className="font-heading font-bold text-2xl mb-4 text-center group-hover:text-white transition-colors duration-500">Premium Services</h3>
                <p className="text-white/90 text-center leading-relaxed group-hover:text-white transition-colors duration-500">
                  <span className="block text-lg">Schnitte & Colorationen</span>
                  <span className="block text-lg">Balayage & Highlights</span>
                  <span className="block text-sm text-white/70 mt-3 group-hover:text-white/80 transition-colors duration-500">Wimpern & Brauen</span>
                </p>
              </div>
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center mt-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-1500">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-white via-white/95 to-white text-black hover:from-white/90 hover:via-white/85 hover:to-white/90 font-bold px-16 py-8 text-xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-700 border-2 border-white/30 relative overflow-hidden group"
              onClick={() => setShowAuthDialog(true)}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
              <Calendar className="mr-4 h-7 w-7 group-hover:rotate-12 transition-transform duration-500" />
              <span className="relative z-10">Termin buchen</span>
            </Button>
            
            <EnterpriseBookingDialog>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-xl text-white hover:bg-white hover:text-black border-3 border-white/60 hover:border-white font-bold px-16 py-8 text-xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-700 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                <Repeat className="mr-4 h-7 w-7 group-hover:rotate-180 transition-transform duration-700" />
                <span className="relative z-10">Erweiterte Buchung</span>
              </Button>
            </EnterpriseBookingDialog>
            
            <ProductsDialog>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-xl text-white hover:bg-white hover:text-black border-3 border-white/60 hover:border-white font-bold px-16 py-8 text-xl rounded-3xl shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-1 transition-all duration-700 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></span>
                <ShoppingBag className="mr-4 h-7 w-7 group-hover:rotate-12 transition-transform duration-500" />
                <span className="relative z-10">Produkte</span>
              </Button>
            </ProductsDialog>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce group cursor-pointer">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-light tracking-wide opacity-80 group-hover:opacity-100 transition-opacity duration-500">Scroll down</span>
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center relative group-hover:border-white/80 transition-colors duration-500">
            <div className="w-1.5 h-4 bg-gradient-to-b from-white/80 to-white/40 rounded-full mt-2 animate-pulse group-hover:bg-white/90 transition-colors duration-500"></div>
            <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          </div>
        </div>
      </div>

      <AuthDialog 
        isOpen={showAuthDialog} 
        onClose={() => setShowAuthDialog(false)} 
      />
    </section>
  );
};

export default Hero;