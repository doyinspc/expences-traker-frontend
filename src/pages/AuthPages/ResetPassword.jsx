import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import { API_PATH_SETTING } from '../../actions/common';

export default function ResetPassword() {
  const [link] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    return { token: params.get('token') || '', tenant: params.get('tenant') || '' };
  });
  const [review, setReview] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const [done, setDone] = useState(false);
  const submit = async (cat, extra = {}) => {
    const { data } = await axios.post(API_PATH_SETTING, { table: 'passwordreset', cat, tenant_db: link.tenant, reset_token: link.token, ...extra }, { headers: { 'Content-Type': 'application/json' } });
    if (data?.success === false || data?.status === 'error') throw new Error(data.message || 'The reset could not be completed.');
    return data.data;
  };
  useEffect(() => {
    // Keep the capability out of browser history, referrers and subsequent navigation.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    let live = true;
    submit('review').then(data => { if (live) setReview(data); }).catch(e => { if (live) setError(e.response?.data?.message || e.message); }).finally(() => { if (live) setBusy(false); });
    return () => { live = false; };
  }, []);
  const save = async e => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('The passwords do not match.'); return; }
    if (new TextEncoder().encode(password).length > 72 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9\s]/.test(password)) { setError('Use 8–72 characters with uppercase and lowercase letters, a number and a symbol.'); return; }
    setBusy(true);
    try { await submit('complete', { new_password: password }); setPassword(''); setConfirm(''); setDone(true); }
    catch (e) { setError(e.response?.data?.message || e.message || 'Please try again.'); }
    finally { setBusy(false); }
  };
  const field = 'mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-950 dark:text-white';
  return <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950"><div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{done ? 'Password updated' : 'Choose a new password'}</h1>
    {done ? <><p role="status" className="mt-3 text-sm text-gray-600 dark:text-gray-300">Your password has changed and previous sessions have ended. Sign in with your new password.</p><Link to="/signin" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-brand-600 px-4 text-white">Go to sign in</Link></> : <>
      {review && <><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Login: {review.login_name}</p><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Use 8–72 characters with uppercase and lowercase letters, a number and a symbol. Choose a password you do not use elsewhere.</p>
      <form onSubmit={save} className="mt-4 space-y-4"><label className="block text-sm text-gray-700 dark:text-gray-300">New password<input required minLength={8} maxLength={72} autoComplete="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={field} /></label><label className="block text-sm text-gray-700 dark:text-gray-300">Confirm new password<input required minLength={8} maxLength={72} autoComplete="new-password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className={field} /></label><button disabled={busy} className="min-h-11 w-full rounded-lg bg-brand-600 px-4 text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save new password'}</button></form></>}
      {busy && !review && <p role="status" className="mt-3 text-sm text-gray-500 dark:text-gray-400">Checking your reset link…</p>}
    </>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
  </div></main>;
}
