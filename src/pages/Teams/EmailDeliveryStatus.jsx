import { useState } from 'react';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, axiosConfig1 } from '../../actions/common';

export default function EmailDeliveryStatus() {
  const [report,setReport]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[test,setTest]=useState(null);
  const load=async()=>{
    const {data}=await axios.get(API_PATH_SETTING,{...axiosConfig,params:{table:'users',cat:'getEmailStatus',data:'{}'}});
    if(data?.success===false||data?.status==='error')throw new Error(data.message||'Email status could not be loaded.');
    setReport(data.data);
  };
  const run=async fn=>{setBusy(true);setError('');try{await fn();}catch(e){setError(e.response?.data?.message||e.message||'Please try again.');}finally{setBusy(false);}};
  const send=()=>run(async()=>{
    const body=new FormData();body.append('table','users');body.append('cat','sendTestEmail');
    const {data}=await axios.post(API_PATH_SETTING,body,axiosConfig1);
    if(data?.success===false||data?.status==='error')throw new Error(data.message||'Email test failed.');
    setTest(data.data);await load();
  });
  const reasons={mail_transport_not_configured:'No outgoing mail connection is configured in the backend .env.',invalid_sender_or_recipient:'The sender or your account email address is invalid.',smtp_connection_authentication_or_delivery_failed:'The SMTP connection, authentication or delivery failed. Check the Gmail app password, sender and hosting access to Gmail SMTP.',mail_transport_or_template_failed:'The mail connection or email template could not be prepared.',notification_composition_failed:'The email could not be composed.'};
  const button='min-h-11 rounded-lg border border-gray-300 px-4 text-sm text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-white';
  const current=test||report?.last_test;
  const config=report?.configuration;
  return <section className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-800">
    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Email delivery</h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check outgoing mail settings and queued notifications. Accepted by the mail server does not confirm inbox delivery.</p>
    <div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={()=>run(load)} className={button}>{busy?'Checking…':report?'Refresh email status':'Check email status'}</button><button type="button" disabled={busy} onClick={send} className={button}>Send test to my email</button></div>
    {config&&<div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <p>Connection: {config.transport_configured?`${config.transport_host||config.transport_type||'Configured'}${config.transport_port?':'+config.transport_port:''}`:'Missing backend mail configuration'}</p>
      <p>Sender: {config.sender_valid?config.sender:'Missing or invalid sender address'}</p><p>Notification copies: {config.cc?.length?config.cc.join(', '):'None configured. Add MAIL_CC_ADDRESS in the backend .env.'}</p>
      <p>Private reset and approval links stay with their recipient; administrative copies omit those links.</p>
      <div className="grid gap-2 sm:grid-cols-3">{[['Password resets',report.queues?.password_resets],['Workflow jobs',report.queues?.workflow_jobs],['Account notices',report.queues?.account_notifications]].map(([label,states])=>{const rows=Array.isArray(states)?states:Object.entries(states||{}).map(([state,count])=>({state,count}));return <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-950"><h3 className="font-medium">{label}</h3>{rows.length?rows.map(row=><p key={row.state}>{row.state==='sent'?'Accepted by mail server':row.state}: {row.count}</p>):<p>No recorded jobs</p>}</div>;})}</div>
    </div>}
    {current&&<p role="status" className={`mt-3 text-sm ${current.accepted_by_mail_server?'text-green-700 dark:text-green-300':'text-red-700 dark:text-red-300'}`}>{current.accepted_by_mail_server?`Test accepted by the mail server for ${current.recipient}. Check that mailbox and Spam.`:reasons[current.failure_code]||'The test was not accepted. Check your backend email configuration.'}</p>}
    {error&&<p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
  </section>;
}
