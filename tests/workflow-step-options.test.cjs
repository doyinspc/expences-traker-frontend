const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const {pathToFileURL}=require('node:url');
const helpers=import(pathToFileURL(path.join(root,'src/utils/functions/workflowStepSettings.js')).href);
test('Only procurement and cash advances offer the cash-disbursement setting',async()=>{
 const {allowsCashDisbursement}=await helpers;
 for(const type of [3,9,'3','9'])assert.equal(allowsCashDisbursement(type),true);
 for(const type of [1,2,4,5,6,7,8,null,undefined,'bad'])assert.equal(allowsCashDisbursement(type),false);
});
test('Saving a requisition step clears an old invalid payment setting without changing its role or order',async()=>{
 const {workflowStepPayload}=await helpers;const old={id:201,item_id1:110,item_id2:2,text_4:'cash_disbursement'};
 assert.deepEqual(workflowStepPayload(old,1),{...old,text_4:'approval'});assert.equal(old.text_4,'cash_disbursement');
 for(const type of [3,9])assert.equal(workflowStepPayload(old,type).text_4,'cash_disbursement');
});
test('Actual Settings form keeps Active out of the form and hides payment controls when requested',async()=>{
 const React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const {default:config}=await import(pathToFileURL(path.join(root,'src/config/users/workflowsteps.js')).href);
 const fields={name:{label:'Step name',type:'text'},text_4:{label:'Cash disbursement',type:'select',options:'payment'},is_active:config.fields.is_active};
 const mocks={
  '../../config/tableMapping':{getFormFields:()=>fields,getTableMapping:()=>({grp:21})},
  '../../utils/functions/formGuidance':{fieldGuidance:{},validateFieldValue:()=>null},
  '../../utils/functions/formDefaults':{},
  './SettingColour.jsx':{ColourSwatch:()=>null},
  '../../utils/functions/settingColours':{},
 };
 const code=require(path.join(root,'node_modules/esbuild')).transformSync(fs.readFileSync(path.join(root,'src/components/ui/DynamicForm.tsx'),'utf8'),{loader:'tsx',format:'cjs',jsx:'automatic'}).code;
 const module={exports:{}};
 vm.runInNewContext(code,{module,exports:module.exports,console,setTimeout,require:id=>{
  if(mocks[id])return mocks[id];
  if(id.startsWith('.'))return props=>React.createElement('div',null,props.children);
  return require(require.resolve(id,{paths:[root]}));
 }});
 const Form=module.exports.default;
 const render=hidden=>renderToStaticMarkup(React.createElement(Form,{tableName:'workflowsteps',hiddenFieldNames:hidden,optionData:{payment:[]}}));
 assert.match(render([]),/Cash disbursement/);assert.doesNotMatch(render(['text_4']),/Cash disbursement/);assert.match(render(['text_4']),/Step name/);assert.doesNotMatch(render([]),/role="switch"|>Active</);
});


test('New steps are active and take their identity from the verified workflow', async () => {
 const {workflowStepWrite}=await helpers;
 const result=workflowStepWrite({grp:0,parent_id:999,item_id1:'110',item_id2:'2'}, {grp:20,id:304,item_id1:1});
 assert.deepEqual(result,{grp:0,parent_id:304,item_id1:110,item_id2:2,is_active:1,text_4:'approval'});
 assert.throws(()=>workflowStepWrite(result,{grp:21,id:304}),/Open the workflow/);
 assert.throws(()=>workflowStepWrite({...result,item_id2:0},{grp:20,id:304}),/approval order/);
});

test('Editing an older step keeps it inactive and leaves its group untouched', async () => {
 const {workflowStepWrite}=await helpers;
 const workflow={grp:20,id:304,item_id1:1};
 const old={id:306,grp:0,parent_id:304,item_id1:110,item_id2:1,is_active:'0'};
 const {grp, ...fields}=old;
 assert.deepEqual(workflowStepWrite(old,workflow),{...fields,is_active:0,text_4:'approval'});
 assert.equal(workflowStepWrite({...old,is_active:true},workflow).is_active,1);
 assert.equal(grp,0);
});

test('The steps table keeps only this workflow and counts the same active steps used for submission', async () => {
 const {workflowStepRows,isActiveWorkflowStep}=await helpers;
 const rows=[{id:2,grp:21,parent_id:304,item_id2:2,is_active:1},{id:1,grp:0,parent_id:304,item_id2:1,is_active:0},{id:3,grp:21,parent_id:305,item_id2:1,is_active:1},{id:4,grp:51,parent_id:304,item_id2:1,is_active:1}];
 const shown=workflowStepRows({data:rows},304);
 assert.deepEqual(shown.map(row=>row.id),[1,4,2]);
 assert.deepEqual(shown.filter(isActiveWorkflowStep).map(row=>row.id),[4,2]);
 assert.deepEqual(workflowStepRows(rows,0),[]);
});

test('Step rows keep role names and omit the workflow name already in the header', async () => {
 const {default:config}=await import(pathToFileURL(path.join(root,'src/config/users/workflowsteps.js')).href);
 assert.equal(config.fields.parent_id.showInTable,false);
 assert.equal(config.fields.parent_name,undefined);
 assert.equal(config.fields.item_name1.showInTable,true);
 assert.equal(config.fields.is_active.hidden,true);
});
