export function initialFormValues(fields,initialData={},group){
  const values=Object.fromEntries(Object.entries(fields||{}).map(([name,field])=>{
    const supplied=initialData[name];
    let value;
    if(supplied!==undefined&&supplied!==null&&supplied!=='')value=supplied;
    else if(name==='grp'&&Number(group)>0)value=group;
    else if(field.default!==undefined&&field.default!==null)value=field.default;
    else value=field.type==='toggle'?false:['date','datetime'].includes(field.type)?null:'';
    return [name,value];
  }));
  if(!Object.hasOwn(values,'grp')&&Number(group)>0)values.grp=initialData.grp||group;
  return values;
}
export function formSubmitPayload(values,initialId,fields={}){
  const payload={...values};
  if(!initialId&&(payload.id===''||payload.id===null))delete payload.id;
  for(const name of Object.keys(payload))if(['created_at','updated_at','deleted_at','last_login_at'].includes(name)||(fields[name]?.disabled&&!['id','grp','parent_id'].includes(name)))delete payload[name];
  return payload;
}
export function resetFormValues(fields,initialData={},group){
  const context=Object.fromEntries(Object.entries(fields||{}).filter(([,field])=>field.hidden).map(([name])=>[name,initialData[name]]));
  return initialFormValues(fields,context,group);
}
