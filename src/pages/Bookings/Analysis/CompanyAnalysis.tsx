import {useMemo} from 'react';
import RecordAnalysis from '../../Components/Analysis';
import {createRecordAnalysis} from '../../../utils/functions/recordAnalysis';
const fields={name:{label:'Company',type:'text'},is_active:{label:'Status',type:'toggle'},created_at:{label:'Company record created',type:'datetime'},total_clients:{label:'Linked clients',type:'number'},total_bookings:{label:'Booked room-days',type:'number'}};
const definition={tableName:'companies',fields,groups:['name','is_active','created_at'],metrics:['count','active_count','inactive_count','total_clients','total_bookings'],defaultGroup:'name',defaultMetric:'total_bookings'};
export default function Analysis({data=[],isLoading=false}:{data?:any[];isLoading?:boolean}){
 const result=useMemo(()=>createRecordAnalysis(data,definition),[data]);
 return <div className="space-y-4"><p className="text-sm text-gray-500 dark:text-gray-400">Booking figures count booked room-days recorded for these clients. Record-creation months are not booking dates. Use the booking calendar for occupancy by stay date.</p><RecordAnalysis analysisData={result} loading={isLoading}/></div>;
}
