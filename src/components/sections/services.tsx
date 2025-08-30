import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scissors, Palette, Eye, Sparkles, ShoppingBag, Calendar } from 'lucide-react';
import servicesImage from '@/assets/salon-services.jpg';
import ProductsDialog from '@/components/booking/products-dialog';
import AuthDialog from '@/components/auth/AuthDialog';

const Services = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const services = [
    {
      icon: Scissors,
      title: 'Haarschnitte',
      description: 'Moderne Schnitte für Damen und Herren, individuell angepasst an Ihren Typ',
      features: ['Beratung & Analyse', 'Waschen & Schneiden', 'Styling & Finish'],
      price: 'ab CHF 65'
    },
    {
      icon: Palette,
      title: 'Colorationen',
      description: 'Professionelle Haarfarbe mit hochwertigen Trinity Haircare Produkten',
      features: ['Farbberatung', 'Vollcoloration', 'Ansatzbehandlung'],
      price: 'ab CHF 85'
    },
    {
      icon: Sparkles,
      title: 'Balayage',
      description: 'Natürliche Highlights für einen sun-kissed Look das ganze Jahr über',
      features: ['Freihändige Technik', 'Natürlicher Farbverlauf', 'Toning'],
      price: 'ab CHF 120'
    },
    {
      icon: Eye,
      title: 'Wimpern & Brauen',
      description: 'Perfekte Augenpartie durch professionelle Wimpern- und Augenbrauenbehandlung',
      features: ['Wimpern färben', 'Brauen zupfen', 'Brauen färben'],
      price: 'ab CHF 25'
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block">
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-primary mb-6 relative">
              Unsere Leistungen
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full"></div>
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            Professionelle Haarpflege und Beauty-Behandlungen mit hochwertigen Trinity Haircare Produkten 
            für Ihren perfekten Look
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="group border-border bg-card hover:shadow-2xl transition-all duration-500 overflow-hidden hover:scale-105 transform">
                  <CardHeader className="pb-6 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
                        <service.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-heading font-bold text-foreground">{service.title}</CardTitle>
                        <Badge variant="secondary" className="text-base font-semibold mt-1 bg-primary/10 text-primary border border-primary/20">
                          {service.price}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary uppercase tracking-wide">Inkludierte Leistungen:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center">
                            <div className="w-2 h-2 bg-gradient-to-r from-primary to-primary/60 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={servicesImage} 
              alt="Professionelle Haarbehandlungen im Schnittwerk Salon"
              className="w-full h-full object-cover min-h-[600px]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/20"></div>
            
            {/* Floating Quality Badge */}
            <div className="absolute top-8 left-8">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">Premium Quality</div>
                    <div className="text-xs text-muted-foreground">Trinity Haircare</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute bottom-8 right-8">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-heading font-bold text-primary">500+</div>
                    <div className="text-xs text-muted-foreground">Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-2xl font-heading font-bold text-primary">10+</div>
                    <div className="text-xs text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-secondary/30 via-secondary/10 to-secondary/30 rounded-3xl p-12">
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Alle Preise verstehen sich als Richtpreise. Der finale Preis wird nach der persönlichen Beratung 
            und Haaranalyse individuell festgelegt.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Badge variant="outline" className="text-base py-2 px-4 border-primary/30 bg-primary/5">
              <Sparkles className="mr-2 h-4 w-4" />
              Trinity Haircare Premium Produkte
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4 border-primary/30 bg-primary/5">
              <Eye className="mr-2 h-4 w-4" />
              Professionelle Beratung inklusive
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4 border-primary/30 bg-primary/5">
              <Scissors className="mr-2 h-4 w-4" />
              Moderne Techniken
            </Badge>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => setShowAuthDialog(true)}
            >
              <Calendar className="mr-3 h-6 w-6" />
              Termin buchen
            </Button>
            <ProductsDialog>
              <Button className="bg-white text-black hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <ShoppingBag className="mr-3 h-6 w-6" />
                Produkte ansehen
              </Button>
            </ProductsDialog>
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

export default Services;