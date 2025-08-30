import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Instagram, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  
  const openingHours = [
    { day: 'Montag', hours: '09:00 - 18:30' },
    { day: 'Dienstag', hours: '09:00 - 18:30' },
    { day: 'Mittwoch', hours: 'Geschlossen' },
    { day: 'Donnerstag', hours: '09:00 - 18:30' },
    { day: 'Freitag', hours: '09:00 - 18:30' },
    { day: 'Samstag', hours: '09:00 - 15:00' },
    { day: 'Sonntag', hours: 'Geschlossen' },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-primary mb-6 relative">
              Kontakt & Standort
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full"></div>
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Besuchen Sie uns im modernen Silberturm St. Gallen oder vereinbaren Sie bequem online einen Termin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Contact Info */}
          <Card className="group border-border bg-card hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
              <CardTitle className="flex items-center gap-4 font-heading text-xl pt-2">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                Standort
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 rounded-xl p-4">
                <p className="font-bold text-foreground text-lg">Schnittwerk</p>
                <p className="text-muted-foreground">Rorschacherstrasse 152</p>
                <p className="text-muted-foreground">9000 St. Gallen</p>
                <p className="text-muted-foreground font-medium">Schweiz (Silberturm)</p>
              </div>
              <Button 
                variant="outline" 
                size="default"
                className="w-full border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 transform"
                onClick={() => window.open('https://maps.google.com/?q=Rorschacherstrasse+152,+9000+St.+Gallen', '_blank')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Auf Karte anzeigen
              </Button>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card className="group border-border bg-card cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 transform" onClick={() => navigate('/kontakt')}>
            <CardHeader className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
              <CardTitle className="flex items-center gap-4 font-heading text-xl pt-2">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                Öffnungszeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {openingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-secondary/20 transition-all duration-200">
                    <span className="text-foreground font-medium">{schedule.day}</span>
                    <span className={`text-sm font-medium ${schedule.hours === 'Geschlossen' ? 'text-red-500' : 'text-primary'}`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-3">
                <p className="text-sm text-primary font-medium text-center">
                  Klicken für vollständige Kontaktinformationen
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <Card className="group border-border bg-card hover:shadow-2xl transition-all duration-500 hover:scale-105 transform">
            <CardHeader className="relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
              <CardTitle className="flex items-center gap-4 font-heading text-xl pt-2">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/20 transition-all duration-200">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <a 
                    href="tel:+41718019265" 
                    className="text-foreground hover:text-primary transition-all duration-300 font-medium"
                  >
                    +41 71 801 92 65
                  </a>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/20 transition-all duration-200">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <a 
                    href="https://www.instagram.com/schnittwerksg?igsh=MXA1NTQzOG90OWU1dw%3D%3D&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-foreground hover:text-primary transition-all duration-300 font-medium"
                  >
                    @schnittwerksg
                  </a>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/20 transition-all duration-200">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <a 
                    href="mailto:info@schnittwerksg.ch"
                    className="text-foreground hover:text-primary transition-all duration-300 font-medium"
                  >
                    info@schnittwerksg.ch
                  </a>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 transform"
                  onClick={() => window.open('tel:+41718019265', '_self')}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Jetzt anrufen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card className="border-border bg-card shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-80 md:h-[500px] overflow-hidden rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2712.8947162344837!2d9.375838815563567!3d47.42271997917442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479b1ed65b8b0b0b%3A0x0!2sRorschacherstrasse%20152%2C%209000%20St.%20Gallen%2C%20Switzerland!5e0!3m2!1sen!2sch!4v1643723456789!5m2!1sen!2sch"
                width="100%"
                height="100%"
                className="border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Schnittwerk Standort"
              ></iframe>
              
              {/* Map Overlay */}
              <div className="absolute top-6 left-6">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-primary">Schnittwerk</div>
                      <div className="text-sm text-muted-foreground">Silberturm St. Gallen</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;