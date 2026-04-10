import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Odesílám...' });
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: 'Zpráva byla úspěšně odeslána. Brzy se Vám ozveme.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Něco se pokazilo.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Chyba serveru. Zkuste to prosím později.' });
    }
  };

  return (
    <main className="font-plusjakarta pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWJ0vQdbqcNXMKAF20fMW34dPMscr55Y-qkKtoLr-JKz6K1C6xPeQmBAHfmoRg7B0VUQ7T3lA6HrpxDPwdj0kMBX7YjqvZgsHTCstyfliglJzUC2g9nzcEiqnOWaG6WUDA239zl8fd-w09ciTNIdgNkoCdHHpVjEsne1yHNyCOgKUoFfEXu2WXcjV2nRo7SsjnSgWDneR2lv-oX2E3x4x7TkeB9jEldibsGYeSBbLoTWZ_OQ7P-UUS2C7894ExhzaLad4aJ8-hDUg"
            alt="contact hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-4 mb-6 rounded-full bg-secondary-fixed text-on-secondary-fixed text-sm font-semibold tracking-widest uppercase font-plusjakarta">Ozvěte se nám</span>
            <h1 className="text-6xl md:text-7xl font-notoserif leading-tight text-primary-container mb-8">Kontakt</h1>
            <p className="text-xl font-plusjakarta leading-relaxed text-on-surface-variant max-w-xl">
              Zaujala Vás nabídka holistického studia Zelený zvon a chcete využít některou z nabízených služeb? Napište, zazvoňte a v co nejkratší době se Vám ozveme.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-surface bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] relative">
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-[2px]"></div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            
            {/* Contact Info Card */}
            <div>
              <div className="bg-surface-container-low p-12 rounded-xl shadow-[0_20px_40px_rgba(15,30,12,0.06)] h-full border border-surface-variant/30">
                <span className="material-symbols-outlined text-4xl text-[#765a17] dark:text-[#ffdf9f] mb-6 block">spa</span>
                <h3 className="text-3xl font-notoserif text-primary-container mb-6">Zelený zvon</h3>
                
                <div className="space-y-8 font-plusjakarta">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#765a17] text-2xl mt-1">location_on</span>
                    <div>
                      <p className="text-lg text-on-surface">Nad sadem 542/19</p>
                      <p className="text-lg text-on-surface-variant">Praha 10, 111 01</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#765a17] text-2xl mt-1">call</span>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Rezervace</h4>
                      <p className="text-2xl text-primary-container font-medium">+420 771 187 776</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-[#765a17] text-2xl mt-1">mail</span>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-1">E-mail</h4>
                      <p className="text-2xl text-primary-container font-medium">info@zelenyzvon.cz</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-surface p-12 rounded-xl shadow-[0_20px_40px_rgba(15,30,12,0.03)] border border-surface-variant/50">
                <h3 className="text-3xl font-notoserif text-primary-container mb-8">Napište mi</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-plusjakarta">
                  {status.message && (
                    <div className={`p-4 rounded-lg font-bold text-sm ${status.type === 'success' ? 'bg-[#765a17]/10 text-[#765a17]' : status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                      {status.message}
                    </div>
                  )}
                  <div>
                    <label className="block mb-2 text-on-surface-variant font-medium">Jméno</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant focus:ring-2 focus:ring-[#765a17] focus:border-transparent transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-on-surface-variant font-medium">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant focus:ring-2 focus:ring-[#765a17] focus:border-transparent transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-on-surface-variant font-medium">Zpráva</label>
                    <textarea 
                      rows="5" 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant focus:ring-2 focus:ring-[#765a17] focus:border-transparent transition-all outline-none resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={status.type === 'loading'}
                    className="mt-4 bg-primary-container text-on-primary px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {status.type === 'loading' ? 'Odesílám...' : 'Odeslat zprávu'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
