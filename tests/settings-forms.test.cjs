const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const bundle=require('esbuild').buildSync({entryPoints:[path.join(root,'src/config/tableMapping.tsx')],bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
const moduleConfig={exports:{}};vm.runInNewContext(bundle.outputFiles[0].text,{module:moduleConfig,exports:moduleConfig.exports,require,console});
const configurations=moduleConfig.exports;
const helpers=import(pathToFileURL(path.join(root,'src/utils/functions/formDefaults.js')).href);
const sections=['roles','departments','locations','expenses','expenseitems','currencys','accounts','vendors','documenttypes','workflowstatus','approvalactions','documentstatus','prioritylevels','workflowtypes','notificationtypes','escalationreasons','rejectionreasons','documentcategories','workflows','workflowsteps','rooms','roomitems','services','serviceitems'];
for(const section of sections)test(`${section}: a new Settings form submits its configured group without an empty record ID`,async()=>{
  const {initialFormValues,formSubmitPayload}=await helpers;
  const config=configurations.getTableMapping(section),fields=configurations.getFormFields(section);
  assert.ok(config&&fields,'Settings form configuration missing');
  const initial=['expenseitems','roomitems','serviceitems','workflowsteps'].includes(section)?{parent_id:901}:{};
  const values=initialFormValues(fields,initial,config.grp),payload=formSubmitPayload(values);
  assert.equal(Number(payload.grp),config.grp,'New record would disappear into another Settings group');
  assert.equal(Object.hasOwn(payload,'id'),false,'Blank ID would be rejected as an existing record');
  if(initial.parent_id)assert.equal(payload.parent_id,901,'Child loses its Settings parent');
});
test('Resetting a new child preserves its parent and group while clearing visible edits',async()=>{
  const {resetFormValues}=await helpers;const fields=configurations.getFormFields('expenseitems');
  const reset=resetFormValues(fields,{parent_id:901,grp:51,name:'Previous text'},51);
  assert.equal(reset.parent_id,901);assert.equal(Number(reset.grp),51);assert.equal(reset.name,'');
});
test('Editing retains the selected record, false flags and zero values instead of applying create defaults',async()=>{
 const {initialFormValues,formSubmitPayload}=await helpers;
 const fields={id:{type:'text',hidden:true},grp:{type:'number',hidden:true},is_active:{type:'toggle',default:true},sort_order:{type:'number',default:5}};
 const values=initialFormValues(fields,{id:912,grp:21,is_active:false,sort_order:0},20);
 assert.deepEqual(formSubmitPayload(values,912),{id:912,grp:21,is_active:false,sort_order:0});
});
test('Creating does not mutate form state or accidentally drop a real edit ID',async()=>{
 const {formSubmitPayload}=await helpers;const values={id:'',grp:1,name:'New role'};
 assert.deepEqual(formSubmitPayload(values),{grp:1,name:'New role'});assert.equal(values.id,'');
 assert.deepEqual(formSubmitPayload({id:54,grp:1},54),{id:54,grp:1});
});
test('Read-only timestamps and disabled display fields are excluded while edit and parent IDs remain',async()=>{
 const {formSubmitPayload}=await helpers;const r=formSubmitPayload({id:21,grp:51,parent_id:9,created_at:null,updated_at:'old',display_total:10,name:'Item'},21,{display_total:{disabled:true},id:{disabled:true}});assert.deepEqual(r,{id:21,grp:51,parent_id:9,name:'Item'});
});
