'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const date = searchParams.get('date');
  const timeSlot = searchParams.get('timeSlot');
  const name = searchParams.get('name');

  // Format date if possible
  let formattedDate = date;
  if (date) {
    try {
      formattedDate = new Date(date).toLocaleDateString('cs-CZ');
    } catch(e) {}
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center border-t-4 border-green-600 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl">check_circle</span>
      </div>
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Děkujeme, {name ? name.split(' ')[0] : 'za Vaši rezervaci'}!
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        Vaše žádost o rezervaci byla úspěšně odeslána ke schválení. Jakmile ji potvrdíme, zašleme Vám informační e-mail.
      </p>

      {(title || date || timeSlot) && (
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 mb-8 text-left inline-block w-full max-w-md">
          <h2 className="text-sm uppercase tracking-wide text-green-800 font-bold mb-4 border-b border-green-200 pb-2">Detail rezervace</h2>
          <div className="space-y-3">
            {title && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Událost:</span>
                <span className="font-semibold text-gray-900">{title}</span>
              </div>
            )}
            {formattedDate && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Datum:</span>
                <span className="font-semibold text-gray-900">{formattedDate}</span>
              </div>
            )}
            {timeSlot && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Čas:</span>
                <span className="font-semibold text-gray-900">{timeSlot}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm gap-2">
          <span className="material-symbols-outlined text-sm">home</span>
          Návrat na hlavní stránku
        </Link>
      </div>
    </div>
  );
}

export default function RezervaceUspechPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Suspense fallback={<div className="text-center p-12 text-gray-500 animate-pulse">Načítám detaily rezervace...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
