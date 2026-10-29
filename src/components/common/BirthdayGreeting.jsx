import {useState} from 'react';
import {useSelector} from 'react-redux';
import {Cake,PartyPopper,X} from 'lucide-react';
import useTeamUpdates from '../../hooks/useTeamUpdates';
import {tokenHelpers} from '../../actions/common';

export default function BirthdayGreeting(){
 const {data}=useTeamUpdates();const user=useSelector(state=>state.authReducer?.user||state.auth?.user||{});
 const [dismissed,setDismissed]=useState('');const key=`prokure-birthday:${tokenHelpers.getTenantDb()}:${user.id}:${data?.today}`;
 let alreadyDismissed=false;try{alreadyDismissed=sessionStorage.getItem(key)==='dismissed';}catch{}
 if(!data?.birthdays?.length||alreadyDismissed||dismissed===key)return null;
 return <aside aria-label="Birthday celebration" className="relative mb-5 overflow-hidden rounded-2xl border border-pink-200 bg-gradient-to-r from-pink-50 via-violet-50 to-blue-50 p-4 sm:p-5 dark:border-pink-900/60 dark:from-pink-950/50 dark:via-violet-950/40 dark:to-blue-950/40">
  <span aria-hidden="true" className="pointer-events-none absolute right-14 top-3 rotate-12 text-pink-400 motion-safe:animate-pulse"><PartyPopper size={38}/></span>
  <div className="flex items-start gap-3 pr-12"><span className="rounded-xl bg-white/80 p-3 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300"><Cake size={25}/></span><div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{data.own_birthday?`Happy birthday${user.first_name?', '+user.first_name:''}!`:'Celebrating birthdays today'}</h2><p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{data.own_birthday?'Wishing you a wonderful day and a great year ahead.':data.birthdays.map(person=>person.name).join(', ')+'. Wishing our colleagues a lovely day!'}</p>{data.own_birthday&&data.birthdays.some(p=>!p.is_self)&&<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Also celebrating: {data.birthdays.filter(p=>!p.is_self).map(p=>p.name).join(', ')}.</p>}</div></div>
  <button type="button" aria-label="Dismiss birthday greeting" onClick={()=>{setDismissed(key);try{sessionStorage.setItem(key,'dismissed');}catch{}}} className="absolute right-2 top-2 rounded-lg p-2 text-gray-500 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-white/10"><X size={18}/></button>
 </aside>;
}
