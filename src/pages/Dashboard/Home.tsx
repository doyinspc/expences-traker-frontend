import DashboardOverview from '../../components/common/DashboardOverview.jsx';
import {useSelector} from 'react-redux';
import {Link} from 'react-router';
import {ClipboardList,ShoppingCart,Wallet,Package,BadgeCheck,ChartNoAxesCombined,Settings,ArrowUpRight} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import useManagementAccess from '../../hooks/useManagementAccess';
import {hasNavigationAccess} from '../../utils/functions/workflowUx';

export default function Home(){
 const auth=useSelector((state:any)=>state.authReducer||state.auth||{});
 const {data:management}=useManagementAccess();
 const location=auth.location||auth.locations?.find((row:any)=>String(row.id)===String(auth.location_id));
 const localAdmin=auth.isAdmin===true||Number(location?.is_admin)===1;
 const allowed=(parent:number,child:number)=>localAdmin||hasNavigationAccess(auth.access,auth.location_id,parent,child);
 const links=[
  {name:'My Approvals',text:'Review requests waiting for your current role.',path:'/procurement/approvals',parent:4,child:1,Icon:BadgeCheck},
  {name:'Requisitions',text:'Request the items your team needs.',path:'/procurement/requisition',parent:3,child:1,Icon:ClipboardList},
  {name:'Procurement',text:'Purchase goods and fulfil approved requests.',path:'/procurement/purchaseorder',parent:3,child:2,Icon:ShoppingCart},
  {name:'Cash advances',text:'Request cash through its own approval process.',path:'/procurement/cashadvance',parent:3,child:3,Icon:Wallet},
  {name:'Stock',text:'Review and record store movements.',path:'/procurement/stock',parent:3,child:6,Icon:Package},
  {name:'Expense report',text:'Review recorded costs for the selected period.',path:'/reports/expense-report',parent:5,child:1,Icon:ChartNoAxesCombined},
 ].filter(item=>allowed(item.parent,item.child));
 return <><PageMeta title="Home | Prokure" description="Your Prokure workspace and available tasks"/><section className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">Your workspace</p><h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">Welcome{auth.user?.first_name?', '+auth.user.first_name:''}</h1><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{location?.name||'Choose a working location'} · {auth.role?.name||'Choose your role'}</p><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">Use the actions available to your current location and access. The notification bell shows approval tasks, birthdays and recently active colleagues.</p></div>
 <DashboardOverview/>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{links.map(({name,text,path,Icon})=><Link key={path} to={path} className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-600"><div className="flex items-center justify-between"><Icon size={24} className="text-brand-600 dark:text-brand-300"/><ArrowUpRight size={17} className="text-gray-400 group-hover:text-brand-500"/></div><h2 className="mt-4 font-semibold text-gray-900 dark:text-white">{name}</h2><p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p></Link>)}</div>
 {!links.length&&<p className="rounded-xl border border-gray-200 p-5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">Select your assigned location and role. If an expected module is missing, ask an administrator to review your access.</p>}
 {(management?.is_super_admin||allowed(6,0))&&<Link to="/setting/company-profile" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300"><Settings size={17}/>Review Company Profile and setup</Link>}
 <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"><h2 className="font-semibold text-gray-900 dark:text-white">Follow the work through</h2><ol className="mt-3 grid gap-3 text-sm text-gray-600 sm:grid-cols-3 dark:text-gray-300"><li><strong>1. Request</strong><p className="mt-1">Choose the document that matches the need.</p></li><li><strong>2. Review</strong><p className="mt-1">Follow its assigned workflow and escalation steps.</p></li><li><strong>3. Complete</strong><p className="mt-1">Record the purchase, payment or stock issue, then check the report.</p></li></ol></div>
 </section></>;
}
