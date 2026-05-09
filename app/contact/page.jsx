'use client';

import { useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Zprávu se nepodařilo odeslat.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Došlo k chybě při komunikaci se serverem.');
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-8 pt-24 pb-32 font-plusjakarta">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-headline italic mb-12 text-primary-container text-center">Kontakt</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Adresa Studia</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Zelený Zvon<br />
                V Brance 123<br />
                Praha 6, 160 00
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Petra Matějíčková</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Telefon: +420 123 456 789<br />
                E-mail: zelenyzvon@gmail.com
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-notoserif italic mb-4">Kde nás najdete</h2>
              <div className="aspect-video bg-surface-container-low rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl opacity-20">map</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low p-10 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-notoserif italic mb-8">Napište nám</h2>

            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
                <span className="material-symbols-outlined text-4xl mb-2 block">check_circle</span>
                <p className="font-bold text-lg mb-1">Zpráva byla odeslána!</p>
                <p className="text-sm opacity-80">Ozveme se Vám co nejdříve.</p>
                <button onClick={() => setStatus(null)} className="mt-4 text-sm underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity">Odeslat další zprávu</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">Jméno</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider opacity-60">Zpráva</label>
                  <textarea
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white dark:bg-neutral-800 border-b-2 border-primary-container/20 py-3 px-4 focus:border-primary-container outline-none transition-all rounded-lg resize-none"
                  ></textarea>
                </div>
                {status === 'error' && (
                  <p className="text-red-600 text-sm font-bold bg-red-50 p-3 rounded-lg">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-primary-container text-on-primary py-4 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Odesílám...</>
                  ) : 'Odeslat zprávu'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link href="/services" className="text-primary-container font-bold underline underline-offset-8 hover:opacity-80 transition-opacity">
            Chcete se raději rovnou objednat? Rezervujte si termín online.
          </Link>
        </div>
      </div>
    </main>
  );
}
