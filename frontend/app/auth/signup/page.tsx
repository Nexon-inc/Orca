'use client';

import { useState, useEffect } from 'react';
import { animate } from 'animejs';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';
import { Eye, EyeOff, Shield, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe", "Others"
].sort();

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'United States'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    animate('.auth-anim', {
      opacity: [0, 1],
      y: [20, 0],
      delay: (el, i) => i * 100,
      duration: 1000,
      ease: 'outExpo'
    });
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-white/5' };
    let score = 0;
    if (pwd.length > 0) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    const levels = [
      { label: 'Weak', color: 'bg-red-500/80' },
      { label: 'Fair', color: 'bg-green/40' },
      { label: 'Good', color: 'bg-green/70' },
      { label: 'Strong', color: 'bg-green' }
    ];
    
    return { score, ...levels[score - 1] || levels[0] };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
          full_name: formData.fullName,
          country: formData.country,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text-body font-dm-mono flex flex-col overflow-x-hidden">
      <Navigation />
      
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-40 pb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-5 text-green">
          <div className="w-full h-full bg-current filter blur-[150px] rounded-full" />
        </div>

        <div className="max-w-xl w-full relative z-10">
          <div className="text-center mb-10">
            <h1 className="auth-anim font-syne text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight uppercase leading-none">
              <span className="text-green">ORCA</span> Signup
            </h1>
            <p className="auth-anim font-dm-mono text-[10px] text-text-muted/60 uppercase tracking-[0.4em] font-bold italic">
              Initialize your autonomous department
            </p>
          </div>

          <div className="auth-anim bg-[#030a06]/80 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green/20 to-transparent" />
            <form className="space-y-6" onSubmit={handleSignup}>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Username</label>
                  <input 
                    type="text" 
                    placeholder="nexus_one"
                    className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                 </div>
                 <div className="space-y-2">
                     <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Authorized Entity"
                    className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Verification Email</label>
                <input 
                  type="email" 
                  placeholder="entity@orca.ai"
                  className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                </div>
                <div className="space-y-2">
                  <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Country</label>
                <select 
                  className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-green/50 transition-all font-bold appearance-none cursor-pointer"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                >
                    {COUNTRIES.map(c => (
                      <option key={c} value={c} className="bg-[#030a06] text-white py-4">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative group/pass">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green/60 hover:text-green transition-colors z-[100]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Strength Meter */}
                  <div className="px-1 pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] text-white/30 uppercase font-bold tracking-tighter">Strength: {strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step}
                          className={`h-full flex-1 transition-all duration-500 ${step <= strength.score ? strength.color : 'bg-white/5'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-dm-mono text-[9px] text-white/30 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                  <div className="relative group/pass">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      className="w-full bg-[#030a06] border border-white/5 rounded-xl p-4 pr-12 text-sm text-white focus:outline-none focus:border-green/50 focus:bg-green/5 transition-all font-bold placeholder:text-white/10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-green/60 hover:text-green transition-colors z-[100]"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

               <div className="flex items-start gap-4 pt-4 group">
                <input 
                  type="checkbox" 
                  className="mt-1 w-5 h-5 accent-green rounded-lg cursor-pointer" 
                  id="tos" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required 
                />
                <label htmlFor="tos" className="text-[11px] text-white/50 leading-relaxed cursor-pointer group-hover:text-white/70 transition-colors uppercase tracking-tight">
                  I agree to the <a href="/terms" className="text-white font-bold hover:text-green underline underline-offset-4 decoration-green/30">Terms of Service</a> and <a href="/privacy" className="text-white font-bold hover:text-green underline underline-offset-4 decoration-green/30">Privacy Policy</a> of Orca.
                </label>
              </div>

               <button 
                type="submit" 
                disabled={loading || !termsAccepted}
                className={`btn-primary w-full py-6 rounded-xl mt-6 text-[15px] font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(0,255,135,0.15)] hover:shadow-[0_20px_60px_rgba(0,255,135,0.3)] transition-all ${loading || !termsAccepted ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {loading ? 'Processing' : 'Create Account →'}
              </button>

               <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[12px] text-white/40 font-bold uppercase tracking-widest">
                  Already have an account? <a href="/auth/login" className="text-green hover:text-green/70 transition-colors underline underline-offset-8 decoration-green/20">Log In</a>
                </p>
              </div>
            </form>
          </div>
          
          <p className="auth-anim mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.5em] font-black italic">
            ORCA Deployment v1.0
          </p>
        </div>
      </section>
    </main>
  );
}
