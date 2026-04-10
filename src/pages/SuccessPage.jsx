import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';

export default function SuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/eshop" replace />;
  }

  return (
    <main className="max-w-3xl mx-auto px-8 pt-20 pb-32 text-center font-plusjakarta">
      <div className="w-20 h-20 bg-[#765a17]/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <span className="material-symbols-outlined text-5xl text-[#765a17]">check_circle</span>
      </div>
      
      <h1 className="text-5xl font-headline italic mb-6 text-[#1b1c19] dark:text-[#faf9f4]">Děkujeme za objednávku!</h1>
      <p className="text-xl opacity-80 mb-12">Vaše objednávka č. <strong className="font-bold">{order.id}</strong> byla úspěšně přijata.</p>

      <div className="bg-surface-container-low p-8 rounded-2xl max-w-md mx-auto text-left shadow-lg border border-[#765a17]/10">
        <h3 className="text-2xl font-notoserif italic mb-6 text-center">Instrukce k platbě</h3>
        
        <div className="space-y-4 mb-8 text-center text-lg">
          <p>Celková částka: <strong className="font-bold text-2xl">{order.totalAmount} Kč</strong></p>
          <p>Číslo účtu: <strong className="font-mono bg-surface-container-high px-2 py-1 rounded">1570560063/0800</strong></p>
          <p>Variabilní symbol: <strong className="font-mono bg-surface-container-high px-2 py-1 rounded">{order.id}</strong></p>
        </div>

        {order.qrCode && (
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl mb-6 shadow-sm">
            <img src={order.qrCode} alt="Platba QR kódem" className="w-[200px] h-[200px] object-contain" />
            <p className="text-sm opacity-60 mt-4 text-[#1b1c19] text-center font-bold">Pro rychlou platbu naskenujte QR<br/>kód ve vaší bankovní aplikaci.</p>
          </div>
        )}

        <p className="text-sm opacity-70 text-center">Fakturu a tyto instrukce jsme Vám zároveň zaslali na e-mail.</p>
      </div>

      <div className="mt-12">
        <Link to="/eshop" className="px-8 py-4 bg-[#101f0d] dark:bg-[#faf9f4] text-[#faf9f4] dark:text-[#101f0d] rounded-full font-bold hover:bg-[#765a17] dark:hover:bg-[#ffdf9f] transition-colors inline-block">
          Zpět do E-shopu
        </Link>
      </div>
    </main>
  );
}
