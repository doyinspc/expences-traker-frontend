import {Cake,UsersRound} from 'lucide-react';
import useTeamUpdates from '../../hooks/useTeamUpdates';

export default function TeamUpdatesPanel(){
 const {data,isPending,error}=useTeamUpdates();
 return <section aria-label="Team updates" className="mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
  <div><h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Cake size={16} className="text-pink-500"/>Birthdays today</h3>{isPending?<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Checking team updates…</p>:error?<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Team updates are unavailable right now.</p>:data?.birthdays?.length?<ul className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-200">{data.birthdays.map(person=><li key={person.id}>{person.name}{person.is_self?' · Happy birthday!':' 🎉'}</li>)}</ul>:<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">No birthdays recorded for today at this location.</p>}</div>
  <div><h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><UsersRound size={16} className="text-emerald-500"/>Online recently <span className="ml-auto text-xs font-normal text-gray-500">{!error&&!isPending&&data?.presence_available ? data.online.length : '—'}</span></h3><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Active within the last 2 minutes at your selected location.</p>
  {!error&&!isPending&&(data?.presence_available===false?<p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Online status is temporarily unavailable.</p>:data?.online?.length?<ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">{data.online.map(person=><li key={person.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"><span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-500"/><span>{person.name}{person.is_self?' (you)':''}</span></li>)}</ul>:<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">No recent activity recorded.</p>)}</div>
 </section>;
}
