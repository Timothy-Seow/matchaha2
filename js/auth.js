// matcha-haha — auth helpers
import { supabase } from './supabase-client.js';

export async function signUpWithEmail({ email, password, fullName }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
}

export async function signInWithEmail({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithMagicLink({ email }) {
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/account.html` },
  });
}

export async function signInWithOAuth(provider /* 'google' | 'apple' */) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${location.origin}/account.html` },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, phone, loyalty_points')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return { ...data, email: user.email };
}

// Convenience: redirect to /signin.html if not authed; returns the user otherwise.
export async function requireAuth({ next } = {}) {
  const user = await getCurrentUser();
  if (!user) {
    const target = next ? `signin.html?next=${encodeURIComponent(next)}` : 'signin.html';
    location.replace(target);
    return null;
  }
  return user;
}
