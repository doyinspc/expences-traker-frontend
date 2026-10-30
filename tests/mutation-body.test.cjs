const {test}=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');const {pathToFileURL}=require('node:url');
const helpers=import(pathToFileURL(path.resolve(__dirname,'../src/utils/functions/mutationBody.js')).href);
test('Normal Settings writes preserve booleans, null dates, numbers and selected scope as JSON',async()=>{
 const {mutationBody}=await helpers;const result=mutationBody('commons','insert',{grp:1},{name:'Finance',is_active:true,is_deleted:false,parent_id:null,sort_order:2},'fixture');
 assert.equal(result instanceof FormData,false);assert.deepEqual(result,{grp:1,name:'Finance',is_active:true,is_deleted:false,parent_id:null,sort_order:2,table:'commons',tenant_db:'fixture',cat:'insert'});
});
test('Mutation routing and tenant metadata cannot be replaced by stale form fields',async()=>{
 const {mutationBody}=await helpers;const r=mutationBody('commons','insert',{}, {table:'other',tenant_db:'other',cat:'insert',id:5},'fixture');assert.equal(r.table,'commons');assert.equal(r.tenant_db,'fixture');assert.equal(r.cat,'insert');
});
test('An existing company upload FormData retains the file, record, field and legacy operation property',async()=>{
 const {mutationBody}=await helpers;const input=new FormData();input.append('id','42');input.append('field','logo_path');input.append('file',new Blob(['synthetic-image'],{type:'image/png'}),'logo.png');input.cat='updateFile';
 const r=mutationBody('company','insert',{},input,'fixture');assert.equal(r.get('cat'),'updateFile');assert.equal(r.get('id'),'42');assert.equal(r.get('field'),'logo_path');assert.equal(r.get('file').name,'logo.png');assert.equal(await r.get('file').text(),'synthetic-image');assert.equal(input.has('table'),false);
});
test('Ordinary binary uploads encode flags as one or zero and never send undefined strings',async()=>{
 const {mutationBody}=await helpers;const r=mutationBody('users','updatePhoto',{id:21},{file:new Blob(['fixture']),is_active:true,is_deleted:false,optional:undefined},'fixture');assert.ok(r instanceof FormData);assert.equal(r.get('is_active'),'1');assert.equal(r.get('is_deleted'),'0');assert.equal(r.has('optional'),false);assert.equal(r.get('id'),'21');
});
test('Embedded form operations take precedence over upload fallback operations',async()=>{
 const {mutationBody}=await helpers;const input=new FormData();input.append('cat','upload');input.append('table','wrong');input.append('tenant_db','wrong');input.append('file',new Blob(['fixture']));const r=mutationBody('requisitionitems','insert',{},input,'fixture');assert.equal(r.get('cat'),'upload');assert.equal(r.get('table'),'requisitionitems');assert.equal(r.get('tenant_db'),'fixture');
});
