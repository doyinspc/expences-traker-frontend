export function localDate(value) {
  if (typeof value?.getTime !== 'function' || Number.isNaN(value.getTime())) return '';
  return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
}
const anniversary=(year,month,day)=>new Date(year,month,Math.min(day,new Date(year,month+1,0).getDate()));
export function fiscalYearRange(anchor,today=new Date(),offset=0) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(anchor||'')))return null;
  const [year,month,day]=anchor.split('-').map(Number),check=new Date(year,month-1,day);
  if(localDate(check)!==anchor)return null;
  let startYear=today.getFullYear();
  if(today<anniversary(startYear,month-1,day))startYear--;
  startYear+=offset;
  const start=anniversary(startYear,month-1,day),end=anniversary(startYear+1,month-1,day);end.setDate(end.getDate()-1);
  return {start_date:localDate(start),end_date:localDate(end),label:end.getFullYear()===startYear?`FY ${startYear}`:`FY ${startYear}/${String(end.getFullYear()).slice(-2)}`};
}
export function reportPeriod(preset='3months',anchor,today=new Date()) {
  if(preset==='all')return {start_date:'',end_date:''};
  if(preset==='fy'||preset==='previous_fy')return fiscalYearRange(anchor,today,preset==='previous_fy'?-1:0);
  if(preset==='fytd'){const range=fiscalYearRange(anchor,today);return range?{...range,end_date:localDate(today)}:null;}
  const match=/^(3|6|12)months$/.exec(preset);
  let start;
  if(match){const target=new Date(today.getFullYear(),today.getMonth()-Number(match[1]),1);start=anniversary(target.getFullYear(),target.getMonth(),today.getDate());}
  else if(preset==='30days'||preset==='60days'){start=new Date(today.getFullYear(),today.getMonth(),today.getDate());start.setDate(start.getDate()-Number(preset.slice(0,-4)));}
  else return null;
  return {start_date:localDate(start),end_date:localDate(today)};
}
