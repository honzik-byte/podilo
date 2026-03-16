'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Přihlášení</h1>
      <p style={{ color: 'var(--muted-text)', marginBottom: '2rem' }}>Vítejte zpět na Podilo.</p>

      <form onSubmit={handleLogin} style={{ background: 'var(--muted)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="label">E-mail</label>
          <input 
            type="email" 
            className="input" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label className="label">Heslo</label>
          <input 
            type="password" 
            className="input" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? 'Přihlašuji...' : 'Přihlásit se'}
        </Button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Nemáte účet? <Link href="/register" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Zaregistrujte se</Link>
        </div>
      </form>
    </div>
  );
}
