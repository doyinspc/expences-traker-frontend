export const analysisFlag = value => value === true || value === 1 || value === '1' || value === 'true' ? true : value === false || value === 0 || value === '0' || value === 'false' ? false : null;
const round = value => Math.round((value + Number.EPSILON) * 1e6) / 1e6;
const numeric = value => value === null || value === undefined || value === '' || typeof value === 'boolean' || !Number.isFinite(Number(value)) ? null : Number(value);
const forbiddenMetric = key => /(^id$|_id$|^item_id|sort_order|weight|percentage|unit_price|^price$|^rate$|response_days)/.test(key);
const metricName = (key,fields) => ({ count:'Records',active_count:'Active records',inactive_count:'Inactive records' }[key] || fields[key]?.label || key);
function groupLabel(row,key,field) {
  const value=row[key];
  if(field.type==='toggle'||key==='is_active'){const flag=analysisFlag(value);return flag===null?'Status not recorded':flag?'Active':'Inactive';}
  if(field.type==='date'||field.type==='datetime'){
    if(!value||/^0000-00/.test(String(value)))return 'Date not recorded';
    const match=String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if(!match)return 'Date not recorded';
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
    return date.getFullYear()===Number(match[1])&&date.getMonth()+1===Number(match[2])&&date.getDate()===Number(match[3])?`${match[1]}-${match[2]}`:'Date not recorded';
  }
  const aliases=[`${key}_display`,key.replace(/_id$/,'_name'),`${key}_name`];
  if(field.type==='select')for(const alias of aliases)if(alias!==key&&row[alias]!==null&&row[alias]!==undefined&&String(row[alias]).trim()!=='')return String(row[alias]);
  if(value===null||value===undefined||String(value).trim()===''||(field.type==='select'&&String(value)==='0'))return 'Not assigned';
  return field.type==='select'&&/^\d+$/.test(String(value))?`Unresolved reference (${value})`:String(value);
}
export function createRecordAnalysis(input,definition,requestedGroup='',requestedMetric='') {
  const rows=Array.isArray(input)?input:[],fields=definition.fields||{};
  const hasValues=key=>rows.some(row=>row[key]!==null&&row[key]!==undefined&&row[key]!=='');
  const groupOptions=(definition.groups||[]).filter(key=>fields[key]&&!['password','file','json','textarea'].includes(fields[key].type)).map(key=>({key,label:fields[key].label+(fields[key].type==='date'||fields[key].type==='datetime'?' (by month)':'')}));
  if(!groupOptions.length)return null;
  const metricOptions=[{key:'count',label:'Records'}];
  for(const key of definition.metrics||[]){
    if(key==='count'||metricOptions.some(option=>option.key===key))continue;
    if(['active_count','inactive_count'].includes(key)){if(fields.is_active)metricOptions.push({key,label:metricName(key,fields)});}
    else if(fields[key]?.type==='number'&&!forbiddenMetric(key)&&hasValues(key))metricOptions.push({key,label:metricName(key,fields)});
  }
  const groupBy=groupOptions.some(o=>o.key===requestedGroup)?requestedGroup:groupOptions.some(o=>o.key===definition.defaultGroup)?definition.defaultGroup:groupOptions[0].key;
  const metric=metricOptions.some(o=>o.key===requestedMetric)?requestedMetric:metricOptions.some(o=>o.key===definition.defaultMetric)?definition.defaultMetric:'count';
  const isCount=['count','active_count','inactive_count'].includes(metric),isDate=['date','datetime'].includes(fields[groupBy].type);
  const currencies=new Set(rows.map(row=>String(row.currency_code||row.currency_id||'')));
  const monetary=!isCount&&/amount|cost|price|budget|(?:^|_)total$/.test(metric)&&!/count|quantity|number/.test(metric);
  const currencyWarning=monetary&&(currencies.size!==1||currencies.has(''))?'Choose records with one recorded currency before comparing money totals.':null;
  const groups=new Map();let missingMetric=0;
  for(const row of rows){
    const label=groupLabel(row,groupBy,fields[groupBy]);
    if(!groups.has(label))groups.set(label,{count:0,value:0,items:[]});
    const group=groups.get(label);group.count++;group.items.push(row);
    let value=metric==='count'?1:metric==='active_count'?Number(analysisFlag(row.is_active)===true):metric==='inactive_count'?Number(analysisFlag(row.is_active)===false):numeric(row[metric]);
    if(value===null){missingMetric++;continue;}
    if(!currencyWarning)group.value=round(group.value+value);
  }
  const totalValue=round([...groups.values()].reduce((sum,g)=>sum+g.value,0));
  const percentageValid=totalValue>0&&[...groups.values()].every(g=>g.value>=0);
  const chartData=[...groups.entries()].map(([name,g])=>({name,count:g.count,value:g.value,percentage:percentageValid?g.value/totalValue*100:null}));
  if(isDate)chartData.sort((a,b)=>a.name.localeCompare(b.name));else chartData.sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
  return {definition,sourceRows:rows,tableName:definition.tableName,chartData,groups:Object.fromEntries(groups),groupNames:chartData.map(g=>g.name),groupBy,metric,groupField:fields[groupBy],metricField:fields[metric],groupLabel:groupOptions.find(o=>o.key===groupBy).label,metricLabel:metricName(metric,fields),groupOptions,metricOptions,totalCount:rows.length,totalValue,missingMetric,currencyWarning,percentageValid,isCount,isDate,activeCount:rows.filter(r=>analysisFlag(r.is_active)===true).length,inactiveCount:rows.filter(r=>analysisFlag(r.is_active)===false).length,unknownStatus:rows.filter(r=>analysisFlag(r.is_active)===null).length,summary:{'Total Records':rows.length,'Selected Measure':totalValue,'Groups':groups.size}};
}
export function compactAnalysisRows(rows,limit=10){
  if(rows.length<=limit)return rows;
  const first=rows.slice(0,limit-1),rest=rows.slice(limit-1);
  return [...first,{name:`Other groups (${rest.length})`,count:rest.reduce((s,r)=>s+r.count,0),value:round(rest.reduce((s,r)=>s+r.value,0)),percentage:rest.every(r=>r.percentage!==null)?rest.reduce((s,r)=>s+r.percentage,0):null}];
}
