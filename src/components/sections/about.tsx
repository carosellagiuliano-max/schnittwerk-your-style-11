import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import transformationImage from '@/assets/hair-transformation.jpg';
import ProductsDialog from '@/components/booking/products-dialog';
import HaircutsDialog from '@/components/booking/haircuts-dialog';
import VanessaProfileDialog from '@/components/booking/vanessa-profile-dialog';

const About = () => {
  const highlights = [
    {
      icon: Award,
      title: 'Premium Qualität',
      description: 'Hochwertige Trinity Haircare Produkte für beste Ergebnisse'
    },
    {
      icon: Users,
      title: 'Erfahrenes Team',
      description: 'Professionelle Coiffeure mit langjähriger Erfahrung'
    },
    {
      icon: Clock,
      title: 'Flexible Termine',
      description: 'Online-Buchung und individuelle Terminvereinbarung'
    },
    {
      icon: Heart,
      title: 'Persönlicher Service',
      description: 'Individuelle Beratung für Ihren perfekten Look'
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="inline-block mb-8">
                <h2 className="text-5xl md:text-6xl font-heading font-bold text-primary mb-4 relative">
                  Willkommen im Schnittwerk
                  <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary to-primary/40 rounded-full"></div>
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Im Herzen von St. Gallen, im modernen <strong className="text-primary">Silberturm</strong>, 
                  finden Sie unser elegantes Hairstudio. Wir sind spezialisiert auf individuelle Haarschnitte, 
                  moderne Colorationen und professionelle Beauty-Behandlungen.
                </p>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Unser erfahrenes Team arbeitet ausschließlich mit hochwertigen 
                  <strong className="text-primary"> Trinity Haircare Produkten</strong> und modernsten Techniken, 
                  um Ihnen den perfekten Look zu verleihen.
                </p>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
                  <p className="text-lg text-primary font-medium italic">
                    "Jeder Kunde ist einzigartig - und so sollte auch sein Haarschnitt sein."
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">- Vanessa Carosella, Inhaberin</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-heading font-bold text-primary">
                Was uns auszeichnet
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {highlights.map((highlight, index) => (
                  <Card key={index} className="group border-border bg-card hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:scale-105 transform">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex-shrink-0 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                          <highlight.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-2 text-lg">
                            {highlight.title}
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {highlight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <img 
                src={transformationImage} 
                alt="Professionelle Haartransformation im Schnittwerk"
                className="w-full h-full object-cover min-h-[700px]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/30"></div>
              
              {/* Floating Quality Badge */}
              <div className="absolute top-8 left-8">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-primary">Zertifiziert</div>
                      <div className="text-xs text-muted-foreground">Premium Salon</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-heading font-bold text-primary mb-1">10+</div>
                      <div className="text-sm text-muted-foreground font-medium">Jahre Erfahrung</div>
                    </div>
                    <div>
                      <div className="text-3xl font-heading font-bold text-primary mb-1">500+</div>
                      <div className="text-sm text-muted-foreground font-medium">Zufriedene Kunden</div>
                    </div>
                    <div>
                      <div className="text-3xl font-heading font-bold text-primary mb-1">100%</div>
                      <div className="text-sm text-muted-foreground font-medium">Trinity Haircare</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;