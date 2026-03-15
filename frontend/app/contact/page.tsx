'use client';

import { useState, useEffect } from 'react';
import { animate, stagger } from 'animejs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });

  useEffect(() => {
    animate('.contact-anim', {
      opacity: [0, 1],
      y: [30, 0],
      delay: stagger(100),
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Transmission Sent:', formData);
    alert('Signal Received. Nexonic Intelligence will respond within 24 hours.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-bg text-text-body">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-32 px-4 bg-bg pt-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="contact-anim opacity-0 font-syne text-5xl sm:text-7xl lg:text-[80px] font-black text-white leading-tight mb-8 uppercase tracking-tighter">
             Direct <span className="text-green">Transmission</span>
          </h1>
          <p className="contact-anim opacity-0 font-dm-mono text-base sm:text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed uppercase tracking-tighter font-black">
            Establish a secure link with Nexonic Industries. We respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 bg-bg">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
           {/* Form Left */}
           <div className="contact-anim opacity-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Full Name</label>
                       <input 
                         type="text" 
                         name="name"
                         value={formData.name}
                         onChange={handleChange}
                         required
                         placeholder="John Doe" 
                         className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 text-white font-dm-mono text-sm focus:border-green/50 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Email Address</label>
                       <input 
                         type="email" 
                         name="email"
                         value={formData.email}
                         onChange={handleChange}
                         required
                         placeholder="john@company.com" 
                         className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 text-white font-dm-mono text-sm focus:border-green/50 transition-all outline-none" 
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Company / Organization</label>
                    <input 
                      type="text" 
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      placeholder="Nexonic Industries" 
                      className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 text-white font-dm-mono text-sm focus:border-green/50 transition-all outline-none" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Brief Description</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5} 
                      placeholder="How can ORCA assist your operations?" 
                      className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 text-white font-dm-mono text-sm focus:border-green/50 transition-all outline-none resize-none" 
                    />
                 </div>
                 <button className="btn-primary w-full py-5 rounded-2xl font-black text-[14px] uppercase tracking-[0.2em]">
                    Establish Link →
                 </button>
              </form>
           </div>

           {/* Info Right */}
           <div className="contact-anim opacity-0 flex flex-col justify-center space-y-12">
              <div>
                 <h3 className="font-syne text-[11px] font-black text-green uppercase tracking-[0.3em] mb-4">Mailing Address</h3>
                 <p className="font-dm-mono text-[15px] text-white/60 leading-relaxed uppercase tracking-tighter font-black">
                    Nairobi, Kenya<br />
                    East Africa AI Corridor
                 </p>
              </div>
              <div>
                 <h3 className="font-syne text-[11px] font-black text-green uppercase tracking-[0.3em] mb-4">Direct Comms</h3>
                 <div className="space-y-2 font-dm-mono text-[15px] text-white/60 leading-none uppercase tracking-tighter font-black">
                    <p className="hover:text-green transition-colors cursor-pointer">hello@nexonic.com</p>
                    <p className="hover:text-green transition-colors cursor-pointer">support@nexonic.com</p>
                 </div>
              </div>
              <div>
                 <h3 className="font-syne text-[11px] font-black text-green uppercase tracking-[0.3em] mb-4">Social Links</h3>
                 <div className="flex gap-6 font-dm-mono text-[13px] text-white/20 font-black uppercase tracking-widest">
                    <span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span>
                    <span className="hover:text-white transition-colors cursor-pointer">Twitter</span>
                    <span className="hover:text-white transition-colors cursor-pointer">GitHub</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
