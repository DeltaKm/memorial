'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenziali non valide');
      } else {
        // Check if session is valid
        const session = await getSession();
        if (session) {
          router.push('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Errore durante il login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/cropped-caiazzo-stemma-250.png" 
              alt="Stemma Caiazzo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Radici Admin</h1>
          <p className="text-gray-600">Accesso amministratore</p>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Login Amministratore
            </CardTitle>
            <CardDescription>
              Inserisci le credenziali per accedere al pannello amministrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Inserisci username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Inserisci password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-800"
                disabled={loading}
              >
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700"
              >
                ← Torna alla vista pubblica
              </a>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Radici - Origini e Memoria</p>
                <p className="text-xs text-gray-400 mt-1">
                  Powered by{' '}
                  <a 
                    href="https://shadowcomputer.it/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900 hover:underline"
                  >
                    Shadow Computer
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
