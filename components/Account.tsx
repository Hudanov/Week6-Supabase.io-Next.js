import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Docs from './Docs';

interface AccountProps {
  session: any;
}

export default function Account({ session }: AccountProps) {
  const [loading, setLoading] = useState<boolean>(true);

  const [first_name, setFirstName] = useState<string | null>(null);
  const [last_name, setLastName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [doc_url, setDocUrl] = useState<string | null>(null);

  interface updateProfileProps {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    country: string | null;
    city: string | null;
    doc_url?: string | null;
  }

  useEffect(() => {
    getProfile();
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      const user = supabase.auth.user();
      if (!user) return;

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name, phone, country, city, doc_url`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setPhone(data.phone);
        setCountry(data.country);
        setCity(data.city);
        setDocUrl(data.doc_url);
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({ first_name, last_name, phone, country, city, doc_url = '' }: updateProfileProps) {
    if (!first_name || !last_name || !phone || !country || !city) {
      console.warn('some parameters === null',
        !first_name, !last_name, !phone, !country, !city, !doc_url,
        first_name, last_name, phone, country, city, doc_url
      );
      return;
    }

    try {
      setLoading(true)
      const user = supabase.auth.user();
      if (!user) return;

      const updates = {
        id: user.id,
        first_name,
        last_name,
        phone,
        country,
        city,
        doc_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="first_name">First name</label>
        <input
          id="first_name"
          type="text"
          value={first_name || ''}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="last_name">Last name</label>
        <input
          id="last_name"
          type="text"
          value={last_name || ''}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={phone || ''}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="text"
          value={country || ''}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          value={city || ''}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <Docs
        url={doc_url as string}
        size={150}
        onUpload={(url: string) => {
          setDocUrl(url);
          updateProfile({ first_name, last_name, phone, country, city, doc_url: url });
        }}
      />

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ first_name, last_name, phone, country, city, /*doc_url*/ })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}