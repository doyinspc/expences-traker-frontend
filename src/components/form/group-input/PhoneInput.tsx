import { useState } from 'react';
interface CountryCode { code?: string; value?: string | number; label: string }
interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  countries: CountryCode[]; value?: string; onChange?: (phone: string) => void; selectPosition?: 'start' | 'end';
}
export default function PhoneInput({ countries=[], value, onChange, selectPosition='start', disabled, className='', name, ...inputProps }: Props) {
  const options=countries.map(country=>({code:String(country.code??country.value??''),label:country.label,prefix:country.label.match(/^\+\d+/)?.[0]||''})).filter(country=>country.code);
  const [internal,setInternal]=useState('');
  const phone=value!==undefined?String(value??''):internal;
  const [country,setCountry]=useState(()=>options.find(option=>option.prefix&&phone.startsWith(option.prefix))?.code||'');
  const update=(next:string)=>{if(value===undefined)setInternal(next);onChange?.(next);};
  const select=<select aria-label={`${name||'Phone'} country code`} value={country} disabled={disabled} onChange={event=>{const next=options.find(option=>option.code===event.target.value);const previous=options.find(option=>option.code===country);setCountry(event.target.value);if(next?.prefix)update(!phone?next.prefix:previous?.prefix&&phone.startsWith(previous.prefix)?next.prefix+phone.slice(previous.prefix.length):phone);}} className="min-h-11 w-20 shrink-0 rounded-lg border border-gray-300 bg-white px-2 text-sm text-gray-700 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"><option value="">Code</option>{options.map(option=><option key={option.code} value={option.code}>{option.code}</option>)}</select>;
  return <div className="flex min-w-0 gap-2">{selectPosition==='start'&&select}<input {...inputProps} name={name} type="tel" autoComplete="tel" value={phone} disabled={disabled} onChange={event=>update(event.target.value)} className={`min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${className}`}/>{selectPosition==='end'&&select}</div>;
}
