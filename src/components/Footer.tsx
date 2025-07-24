import { MessageSquare, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", href: "#features" },
        { label: "Tarifs", href: "#pricing" },
        { label: "Intégrations", href: "#integrations" },
        { label: "API", href: "#api" }
      ]
    },
    {
      title: "Secteurs",
      links: [
        { label: "Restauration", href: "#restaurant" },
        { label: "Commerce", href: "#commerce" },
        { label: "Hôtellerie", href: "#hotel" },
        { label: "Services", href: "#services" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Centre d'aide", href: "#help" },
        { label: "Documentation", href: "#docs" },
        { label: "Formation", href: "#training" },
        { label: "Communauté", href: "#community" }
      ]
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "#about" },
        { label: "Blog", href: "#blog" },
        { label: "Carrières", href: "#careers" },
        { label: "Partenaires", href: "#partners" }
      ]
    }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-card-foreground">Whalix</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              La solution d'automatisation WhatsApp spécialement conçue pour les entrepreneurs 
              de Côte d'Ivoire. Transformez vos conversations en ventes automatisées.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+225 XX XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>contact@whalix.ci</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-card-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-card-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">
              Restez informé des nouveautés Whalix
            </h3>
            <p className="text-muted-foreground mb-6">
              Recevez nos conseils, cas d'usage et mises à jour produit directement dans votre boîte mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="votre@email.com"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Whalix. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <a href="#privacy" className="text-xs text-muted-foreground hover:text-card-foreground transition-colors">
                Politique de confidentialité
              </a>
              <a href="#terms" className="text-xs text-muted-foreground hover:text-card-foreground transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#legal" className="text-xs text-muted-foreground hover:text-card-foreground transition-colors">
                Mentions légales
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="#facebook"
              className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-card-foreground transition-colors" />
            </a>
            <a
              href="#instagram"
              className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-card-foreground transition-colors" />
            </a>
            <a
              href="#linkedin"
              className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-muted-foreground hover:text-card-foreground transition-colors" />
            </a>
          </div>
        </div>

        {/* Made in Côte d'Ivoire Badge */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span>🇨🇮</span>
            <span>Fièrement développé en Côte d'Ivoire</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;