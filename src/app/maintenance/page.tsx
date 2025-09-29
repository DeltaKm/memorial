'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/maintenance/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Imposta un cookie per bypassare la manutenzione
        document.cookie = `maintenance_bypass=${data.token}; path=/; max-age=3600`; // 1 ora
        router.push('/');
      } else {
        setError('Password non corretta');
      }
    } catch (error) {
      setError('Errore di connessione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo del Comune */}
        <div className="mb-2">
          <Image 
            src="/cropped-caiazzo-stemma-250.png" 
            alt="Stemma Comune di Caiazzo" 
            width={80}
            height={80}
            className="mx-auto object-contain"
            priority
          />
        </div>
        
        {/* Titolo */}
        <h1 className="text-1xl font text-gray-800 mb-4">
          Città di Caiazzo
        </h1>
        
        {/* Sottotitolo */}
        <h2 className="text-2xl text-gray-600 mb-8">
          Radici - Archivio Storico
        </h2>
        
        {/* Messaggio */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Maintenance
            </h3>
            <p className="text-black">
              Stiamo lavorando per migliorare la tua esperienza. 
              Torna presto per accedere all'archivio storico.
            </p>
          </div>
          
          {/* Form di accesso */}
          <form onSubmit={handleLogin} className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Accesso Autorizzato</h4>
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password di accesso"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              {error && (
                <p className="text-red-600 text-xs">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifica...' : 'Accedi'}
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="text-xs text-black border-t pt-4 mt-4">
            Powered by{' '}
            <a 
              href="https://cmh.it/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline"
            >
              CMH
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
