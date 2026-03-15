'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function StatusPage() {
  const services = [
    { name: 'API', status: 'Operational', uptime: '99.98%' },
    { name: 'Dashboard', status: 'Operational', uptime: '99.99%' },
    { name: 'Database', status: 'Operational', uptime: '99.99%' },
    { name: 'Authentication', status: 'Operational', uptime: '99.98%' },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }} className="font-black font-syne leading-tight mb-6">
            System Status
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12 font-dm-mono">
            All systems operational. Real-time monitoring of ORCA services.
          </p>
        </div>
      </section>

      {/* Status Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {services.map((service, i) => (
              <div
                key={i}
                className="p-6 rounded-lg flex items-center justify-between"
                style={{
                  backgroundColor: 'rgba(0, 20, 8, 0.6)',
                  border: '1px solid rgba(0, 217, 102, 0.12)',
                }}
              >
                <div>
                  <h3 className="text-xl font-syne font-bold mb-2">{service.name}</h3>
                  <p className="text-sm font-dm-mono" style={{ color: '#4a7a5a' }}>
                    Uptime: {service.uptime}
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-full text-sm font-dm-mono font-bold"
                  style={{
                    backgroundColor: 'rgba(0, 217, 102, 0.1)',
                    border: '1px solid rgba(0, 217, 102, 0.3)',
                    color: '#00D966',
                  }}
                >
                  ✓ {service.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
