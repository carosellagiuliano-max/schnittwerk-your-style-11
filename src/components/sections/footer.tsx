import React from 'react';
import { Instagram, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl font-heading font-bold mb-2">Schnittwerk</h3>
              <p className="text-sm font-nunito text-primary-foreground/90 tracking-wide">
                BY VANESSA CAROSELLA
              </p>
            </div>
            <p className="text-lg text-primary-foreground/90 font-medium">
              Dein Look. Dein Schnittwerk.
            </p>
            <p className="text-primary-foreground/80 leading-relaxed">
              Moderner Premium-Coiffeur im Silberturm St. Gallen für Damen und Herren. 
              Hochwertige Behandlungen mit Trinity Haircare Produkten.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className="font-heading font-bold text-xl">Navigation</h4>
            <ul className="space-y-3">
              <li><a href="/" className="text-primary-foreground/90 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block">Startseite</a></li>
              <li><a href="/leistungen" className="text-primary-foreground/90 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block">Leistungen & Preise</a></li>
              <li><a href="/team" className="text-primary-foreground/90 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block">Team</a></li>
              <li><a href="/galerie" className="text-primary-foreground/90 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block">Galerie</a></li>
              <li><a href="/shop" className="text-primary-foreground/90 hover:text-white transition-all duration-300 hover:translate-x-1 transform inline-block">Shop</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-heading font-bold text-xl">Kontakt</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300">
                <MapPin className="h-5 w-5 mt-0.5 text-white" />
                <div className="text-primary-foreground/90 leading-relaxed">
                  <div className="font-medium">Rorschacherstrasse 152</div>
                  <div>9000 St. Gallen</div>
                  <div className="text-sm text-primary-foreground/70">Silberturm</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300">
                <Phone className="h-5 w-5 text-white" />
                <a 
                  href="tel:+41718019265" 
                  className="text-primary-foreground/90 hover:text-white transition-all duration-300 font-medium"
                >
                  +41 71 801 92 65
                </a>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300">
                <Instagram className="h-5 w-5 text-white" />
                <a 
                  href="https://www.instagram.com/schnittwerksg?igsh=MXA1NTQzOG90OWU1dw%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary-foreground/90 hover:text-white transition-all duration-300 font-medium"
                >
                  @schnittwerksg
                </a>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all duration-300">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href="mailto:info@schnittwerksg.ch"
                  className="text-primary-foreground/90 hover:text-white transition-all duration-300 font-medium"
                >
                  info@schnittwerksg.ch
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h4 className="font-heading font-bold text-xl">Öffnungszeiten</h4>
            <div className="bg-white/10 rounded-2xl p-6 space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-primary-foreground/90 font-medium">Mo-Di, Do-Fr:</span>
                <span className="text-white font-bold">09:00-18:30</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-primary-foreground/90 font-medium">Samstag:</span>
                <span className="text-white font-bold">09:00-15:00</span>
              </div>
              <div className="flex justify-between items-center py-1 opacity-60">
                <span className="text-primary-foreground/70">Mi & So:</span>
                <span className="text-red-300">Geschlossen</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/30 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-primary-foreground/80">
            © 2024 Schnittwerk by Vanessa Carosella. Alle Rechte vorbehalten.
          </div>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="/impressum" className="text-primary-foreground/80 hover:text-white transition-all duration-300 hover:scale-105 transform">
              Impressum
            </a>
            <a href="/datenschutz" className="text-primary-foreground/80 hover:text-white transition-all duration-300 hover:scale-105 transform">
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;