'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface UserRoleManagerProps {
  userId: string;
  role: string;
}

export default function UserRoleManager({ userId, role }: UserRoleManagerProps) {
  const [value, setValue] = useState(role);
  const [loading, setLoading] = useState(false);

  return (
    <select
      className={styles.statusSelect}
      value={value}
      disabled={loading}
      onChange={async (event) => {
        const nextRole = event.target.value;
        const previous = value;
        setValue(nextRole);
        setLoading(true);

        const { error } = await supabase
          .from('user_roles')
          .update({ role: nextRole })
          .eq('user_id', userId);

        if (error) {
          setValue(previous);
          alert(error.message);
        }

        setLoading(false);
      }}
    >
      <option value="user">Uživatel</option>
      <option value="admin">Admin</option>
    </select>
  );
}
