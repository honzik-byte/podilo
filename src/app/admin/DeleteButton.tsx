'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

export default function DeleteButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete tento inzerát smazat? Tato akce je nevratná.')) return;

    setLoading(true);
    
    // First, try to fetch images to delete from storage as well
    const { data: listingData } = await supabase
      .from('listings')
      .select('images')
      .eq('id', listingId)
      .single();

    if (listingData && listingData.images) {
      const paths = listingData.images.map((url: string) => {
        const parts = url.split('/');
        return parts[parts.length - 1]; // get file name
      });
      
      if (paths.length > 0) {
        await supabase.storage.from('listing_images').remove(paths);
      }
    }

    // Now delete the record from Postgres
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      alert('Chyba při mazání: ' + error.message);
    } else {
      router.refresh();
    }
    
    setLoading(false);
  };

  return (
    <Button 
      onClick={handleDelete} 
      disabled={loading}
      style={{
        backgroundColor: '#dc2626', 
        color: 'white', 
        padding: '0.4rem 0.8rem', 
        fontSize: '0.8rem'
      }}
    >
      {loading ? 'Mažu...' : 'Smazat inzerát'}
    </Button>
  );
}
