import {useMemo} from 'react';
import RecordAnalysis from '../../Components/Analysis';
import {createRecordAnalysis} from '../../../utils/functions/recordAnalysis';
const fields={company_name:{label:'Company',type:'text'},is_active:{label:'Status',type:'toggle'},created_at:{label:'Client record created',type:'datetime'},total_bookings:{label:'Booked room-days',type:'number'},active_bookings:{label:'Reserved room-days',type:'number'},lodged_bookings:{label:'Occupied room-days',type:'number'},vacated_bookings:{label:'Vacated room-days',type:'number'}};
const definition={tableName:'clients',fields,groups:['company_name','is_active','created_at'],metrics:['count','active_count','inactive_count','total_bookings','active_bookings','lodged_bookings','vacated_bookings'],defaultGroup:'company_name',defaultMetric:'count'};
export default function Analysis({data=[],isLoading=false}:{data?:any[];isLoading?:boolean}){
 const result=useMemo(()=>createRecordAnalysis(data,definition),[data]);
 return <div className="space-y-4"><p className="text-sm text-gray-500 dark:text-gray-400">Booking figures count booked room-days recorded for these clients. Record-creation months are not booking dates. Use the booking calendar for occupancy by stay date.</p><RecordAnalysis analysisData={result} loading={isLoading}/></div>;
}
