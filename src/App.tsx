import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabase';
import { LoginButton } from './components/LoginButton';

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      {!session ? (
        <div>
          <h1>Welcome to JEE-Dost</h1>
          <p>Login to get your 5 free JEE prep questions!</p>
          <LoginButton />
        </div>
      ) : (
        <div>
          <h1>Hi, {session.user.user_metadata.full_name}!</h1>
          <p>You are logged in. Ready to crack JEE?</p>
          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: '20px' }}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
