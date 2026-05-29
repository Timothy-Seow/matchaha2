// matcha-haha — header auth state
// Swaps the "Sign In" link for a user menu when the visitor is authenticated.
// Listens to onAuthStateChange so a sign-in in one tab updates other tabs.

import { supabase } from './supabase-client.js';
import { signOut } from './auth.js';

function firstName(user) {
  const full = user?.user_metadata?.full_name || user?.email || '';
  return full.split(' ')[0].split('@')[0];
}

function render(session) {
  const utils = document.querySelector('.header-utils');
  if (!utils) return;

  // Find the existing Sign In / user link by id (we set it during page render).
  let signIn = utils.querySelector('#auth-link');
  if (!signIn) return;

  if (session?.user) {
    signIn.innerHTML = `Hello, ${firstName(session.user)}`;
    signIn.href = 'account.html';
    signIn.classList.add('authed');

    // Add a small sign-out link next to it (idempotent)
    if (!utils.querySelector('#signout-link')) {
      const out = document.createElement('a');
      out.id = 'signout-link';
      out.href = '#';
      out.className = 'util-link';
      out.textContent = 'Sign out';
      out.addEventListener('click', async (e) => {
        e.preventDefault();
        await signOut();
        location.href = 'index.html';
      });
      signIn.after(out);
    }
  } else {
    signIn.textContent = 'Sign In';
    signIn.href = 'signin.html';
    signIn.classList.remove('authed');
    utils.querySelector('#signout-link')?.remove();
  }
}

(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  render(session);
  supabase.auth.onAuthStateChange((_event, session) => render(session));
})();
