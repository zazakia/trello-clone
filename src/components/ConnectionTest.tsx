import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function ConnectionTest() {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic Supabase connection
        const { data, error } = await supabase
          .from('boards')
          .select('count')
          .single();

        if (error) {
          console.error('Connection test error:', error);
          setErrorMessage(error.message);
          setStatus('error');
        } else {
          console.log('Connection test successful:', data);
          setStatus('success');
        }
      } catch (err) {
        console.error('Connection test failed:', err);
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    };

    testConnection();
  }, []);

  if (status === 'testing') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700">Testing Supabase connection...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium">Connection Failed</p>
        <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
        <details className="mt-2">
          <summary className="text-red-600 text-sm cursor-pointer">Troubleshooting</summary>
          <div className="mt-2 text-xs text-red-600">
            <p>1. Check if your Supabase URL and API key are correct in .env</p>
            <p>2. Ensure you've run the schema.sql in your Supabase project</p>
            <p>3. Check if the 'boards' table exists in your database</p>
            <p>4. Verify that RLS policies allow public access</p>
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-700 font-medium">✅ Supabase connection successful!</p>
    </div>
  );
}