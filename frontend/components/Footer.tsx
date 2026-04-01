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
              {/* X / Twitter */}
              <a 
                href="https://x.com/Nexon_ke" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-green hover:text-bg hover:bg-green transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/nexonic-industries/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-green hover:text-bg hover:bg-green transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/nexoninc/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:border-green hover:text-bg hover:bg-green transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
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

