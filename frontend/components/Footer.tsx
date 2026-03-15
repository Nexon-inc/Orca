'use client';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-bg py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-6">
            <div>
              <a href="/" className="font-syne font-[800] text-[20px] text-green tracking-tight hover:opacity-80 transition-opacity">
                ORCA
              </a>
              <p className="mt-2 font-dm-mono text-[11px] text-text-muted">
                AI Company OS by Nexonic Industries
              </p>
            </div>
            <p className="font-dm-mono text-[13px] text-text-body leading-relaxed">
              Your AI workforce. One dashboard.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://linkedin.com/in/nexonic-industries" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-green/50 hover:text-green transition-all"
              >
                <span className="text-[14px]">in</span>
              </a>
            </div>
          </div>

          {/* Col 2 — Product */}
          <div>
            <h4 className="font-syne font-bold text-[14px] text-white mb-6 uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-4">
              {['Features', 'Departments', 'Pricing', 'Integrations'].map((link) => (
                <li key={link}>
                  <a href={`/${link.toLowerCase()}`} className="font-dm-mono text-[12px] text-text-muted hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Corporate */}
          <div>
            <h4 className="font-syne font-bold text-[14px] text-white mb-6 uppercase tracking-wider">Corporate</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <a href="/about" className="font-dm-mono text-[12px] text-text-muted hover:text-white transition-colors">
                  About Nexonic
                </a>
              </li>
              <li>
                <a href="mailto:nexonicindustries@gmail.com" className="font-dm-mono text-[12px] text-green hover:underline transition-colors">
                  nexonicindustries@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — Company */}
          <div>
            <h4 className="font-syne font-bold text-[14px] text-white mb-6 uppercase tracking-wider">Company</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'About', href: '/about' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
                { name: 'Security Protocols', href: '/security' }
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="font-dm-mono text-[12px] text-text-muted hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="font-dm-mono text-[11px] text-text-muted text-center md:text-left">
            © 2025 Nexonic Industries. All rights reserved.
          </p>
          <div className="flex gap-8">
              <a href="/docs" className="text-text-muted hover:text-white transition-colors">Documentation</a>
              <a href="/integrations" className="text-text-muted hover:text-white transition-colors">Integrations</a>
              <a href="/status" className="text-text-muted hover:text-white transition-colors">System Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

