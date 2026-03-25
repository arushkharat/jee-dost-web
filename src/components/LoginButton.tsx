import React from 'react';
import { signInWithGoogle } from '../services/supabase';

export const LoginButton = () => {
  return (
    <button 
      onClick={signInWithGoogle}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Login with Google
    </button>
  );
};
