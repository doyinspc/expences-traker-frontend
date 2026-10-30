/** Preserve JSON types for normal writes and preserve real files for upload forms. */
export function mutationBody(table,queryType,mainParam={},param={},tenant=''){
  const sourceForm=param instanceof FormData;
  const cat=(sourceForm?param.get('cat'):param.cat)||param.cat||queryType||'insert';
  const binary=sourceForm||Object.values(param).some(value=>value instanceof Blob);
  if(!binary){const {cat:ignoredCat,...values}=param;return {...mainParam,...values,table,tenant_db:tenant,cat};}
  const body=new FormData();
  const append=(name,value)=>{
    if(value===undefined)return;
    body.append(name,value instanceof Blob?value:typeof value==='boolean'?(value?'1':'0'):value===null?'':typeof value==='object'?JSON.stringify(value):String(value));
  };
  if(sourceForm){for(const [name,value]of param.entries())append(name,value);for(const [name,value]of Object.entries(mainParam))if(!body.has(name))append(name,value);}
  else for(const [name,value]of Object.entries({...mainParam,...param}))append(name,value);
  body.set('table',table);body.set('tenant_db',tenant);body.set('cat',cat);
  return body;
}
