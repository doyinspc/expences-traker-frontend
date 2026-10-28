import { useState } from 'react';
import { useSelector } from 'react-redux';
import { KeyRound, Eye, EyeOff, RefreshCw, Mail } from 'lucide-react';

interface Props {
  UserData: { id?: string | number; first_name?: string; last_name?: string; email?: string; employee_id?: string };
  onClose?: () => void; onSave?: () => void;
  onUpdatePassword?: (data: { id: string | number; new_password: string; current_password?: string }) => Promise<any>;
  onForceReset?: (data: { id: string | number; force_reset: boolean }) => Promise<any>;
  isLoading?: boolean;
}
const control = 'mt-1.5 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 pr-12 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-brand-900';
export default function UserPasswordPage({ UserData, onClose, onSave, onUpdatePassword, isLoading=false }: Props) {
  const signedInId=useSelector((state: any) => state.authReducer?.user?.id);
  const self=Boolean(signedInId && String(signedInId)===String(UserData?.id));
  const [values,setValues]=useState({current_password:'',new_password:'',confirm_password:''});
  const [visible,setVisible]=useState<Record<string,boolean>>({});
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState(false), [failure,setFailure]=useState(''), [saved,setSaved]=useState('');
  const busy=saving||isLoading;
  const requirements=[['8–72 characters',values.new_password.length>=8&&values.new_password.length<=72],['Uppercase letter',/[A-Z]/.test(values.new_password)],['Lowercase letter',/[a-z]/.test(values.new_password)],['Number',/[0-9]/.test(values.new_password)],['Symbol',/[^A-Za-z0-9\s]/.test(values.new_password)]] as const;
  const submit=async(event: React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault(); if(busy)return; setFailure('');setSaved('');
    const next: Record<string,string>={};
    if(self&&!values.current_password)next.current_password='Enter your current password.';
    if(!requirements.every(([,valid])=>valid))next.new_password='Use 8–72 characters with uppercase and lowercase letters, a number and a symbol.';
    if(!values.confirm_password||values.new_password!==values.confirm_password)next.confirm_password='The two new passwords must match.';
    setErrors(next);
    if(Object.keys(next).length){document.getElementById(`password-${Object.keys(next)[0]}`)?.focus();return;}
    if(!onUpdatePassword||!UserData?.id){setFailure('Password management is unavailable for this account.');return;}
    setSaving(true);
    try {
      const result=await onUpdatePassword({id:UserData.id,new_password:values.new_password,...(self?{current_password:values.current_password}:{})});
      if(result?.status==='error'||result?.success===false)throw new Error(result.message||'Password could not be updated.');
      const notification=result?.notifications;
      setSaved(notification?.sent>0?'Password changed. A confirmation email with login details was sent to the user.':notification?.queued>0?'Password changed. The confirmation email is queued for delivery.':notification?.failed>0?'Password changed, but the email could not be delivered or queued. Contact your administrator.':'Password changed.');
      setValues({current_password:'',new_password:'',confirm_password:''});setVisible({});onSave?.();
    }catch(error:any){setFailure(error.response?.data?.message||error.message||'The password could not be updated.');}
    finally{setSaving(false);}
  };
  const fields=[...(self?[['current_password','Current password']]:[]),['new_password','New password'],['confirm_password','Confirm new password']];
  return <section aria-labelledby="password-manager-title" className="space-y-5">
    <div className="flex items-start gap-3"><KeyRound size={23} className="mt-1 shrink-0 text-brand-500" aria-hidden="true" /><div><h2 id="password-manager-title" className="text-xl font-semibold text-gray-900 dark:text-white">Password Manager</h2><p className="mt-1 break-words text-sm text-gray-500 dark:text-gray-400">{UserData?.first_name} {UserData?.last_name} · {UserData?.employee_id || UserData?.email || 'Account details unavailable'}</p></div></div>
    <p className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"><Mail size={18} className="mt-1 shrink-0" aria-hidden="true" />After a successful change, the user receives an email with their login name and sign-in link. Passwords are kept private.</p>
    {failure&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{failure}</p>}
    {saved&&<p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">{saved}</p>}
    <form noValidate onSubmit={submit} aria-busy={busy}><fieldset disabled={busy} className="space-y-4">{fields.map(([name,label])=><div key={name}><label htmlFor={`password-${name}`} className="text-sm font-medium text-gray-700 dark:text-gray-200">{label} *</label><div className="relative"><input id={`password-${name}`} name={name} type={visible[name]?'text':'password'} required autoComplete={name==='current_password'?'current-password':'new-password'} maxLength={name==='current_password'?undefined:72} value={values[name as keyof typeof values]} onChange={event=>{setValues(previous=>({...previous,[name]:event.target.value}));setErrors(previous=>({...previous,[name]:''}));}} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name]?`password-${name}-error`:undefined} className={control}/><button type="button" onClick={()=>setVisible(previous=>({...previous,[name]:!previous[name]}))} aria-label={`${visible[name]?'Hide':'Show'} ${label.toLowerCase()}`} className="absolute bottom-0 right-0 flex size-11 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400">{visible[name]?<EyeOff size={18} aria-hidden="true"/>:<Eye size={18} aria-hidden="true"/>}</button></div>{errors[name]&&<p id={`password-${name}-error`} className="mt-1 text-xs text-red-600 dark:text-red-300">{errors[name]}</p>}</div>)}
      {values.new_password&&<ul aria-label="Password requirements" className="grid grid-cols-2 gap-2 text-xs">{requirements.map(([label,valid])=><li key={label} className={valid?'text-emerald-700 dark:text-emerald-300':'text-gray-500 dark:text-gray-400'}>{valid?'✓':'○'} {label}</li>)}</ul>}
      <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Other signed-in sessions for this account will end when its password changes.</p>
      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{busy&&<RefreshCw size={16} className="animate-spin" aria-hidden="true"/>}{busy?'Updating…':'Update password'}</button>{onClose&&<button type="button" onClick={onClose} disabled={busy} className="min-h-11 px-4 text-sm text-gray-600 dark:text-gray-300">Cancel</button>}</div>
    </fieldset></form>
  </section>;
}
