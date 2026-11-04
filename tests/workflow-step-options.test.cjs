const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const {pathToFileURL}=require('node:url');
const helpers=import(pathToFileURL(path.join(root,'src/utils/functions/workflowStepSettings.js')).href);
test('Only procurement and cash advances offer the cash-disbursement setting',async()=>{
 const {allowsCashDisbursement}=await helpers;
 for(const type of [2,3,'2','3'])assert.equal(allowsCashDisbursement(type),true);
 for(const type of [1,4,5,6,7,8,null,undefined,'bad'])assert.equal(allowsCashDisbursement(type),false);
});
test('Saving a requisition step clears an old invalid payment setting without changing its role or order',async()=>{
 const {workflowStepPayload}=await helpers;const old={id:201,item_id1:110,item_id2:2,text_4:'cash_disbursement'};
 assert.deepEqual(workflowStepPayload(old,1),{...old,text_4:'approval'});assert.equal(old.text_4,'cash_disbursement');
 for(const type of [2,3])assert.equal(workflowStepPayload(old,type).text_4,'cash_disbursement');
});
test('Actual Settings form hides payment controls while preserving ordinary workflow fields',()=>{
 const React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
 const fields={name:{label:'Step name',type:'text'},text_4:{label:'Cash disbursement',type:'select',options:'payment'}};
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
 assert.match(render([]),/Cash disbursement/);assert.doesNotMatch(render(['text_4']),/Cash disbursement/);assert.match(render(['text_4']),/Step name/);
});
