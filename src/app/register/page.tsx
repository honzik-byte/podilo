'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Účet vytvořen! Pokud je vyžadováno potvrzení e-mailu vaším Supabase nastavením, zkontrolujte si schránku. Jinak se můžete přihlásit.');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: '500px', padding: '5rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Registrace</h1>
      <p style={{ color: 'var(--muted-text)', marginBottom: '2rem' }}>Vytvořte si účet pro přidávání inzerátů.</p>

      <form onSubmit={handleRegister} style={{ background: 'var(--muted)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        
        {message && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {message}
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
            minLength={6}
          />
        </div>

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? 'Vytvářím účet...' : 'Zaregistrovat se'}
        </Button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Již máte účet? <Link href="/login" style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Přihlaste se</Link>
        </div>
      </form>
    </div>
  );
}
