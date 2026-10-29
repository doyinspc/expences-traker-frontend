const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const {transformSync}=require(path.join(root,'node_modules/esbuild'));
const React=require(path.join(root,'node_modules/react'));
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
function load(relative){
 const filename=path.join(root,relative),module={exports:{}};
 const result=transformSync(fs.readFileSync(filename,'utf8'),{loader:/jsx$/.test(relative)?'jsx':'js',format:'cjs',jsx:'automatic'});
 vm.runInNewContext(result.code,{module,exports:module.exports,require(id){
  if(id==='../../utils/functions')return {isJsonParsable:value=>{try{JSON.parse(value);return true;}catch{return false;}}};
  if(id.startsWith('.')){let next=path.resolve(path.dirname(filename),id);if(!path.extname(next))next+='.js';return load(path.relative(root,next));}
  return require(require.resolve(id,{paths:[root]}));
 }});return module.exports;
}
const {workflowGuide,workflowStage}=load('src/utils/functions/workflowGuide.js');
const steps=[{id:30,step_serial_number:3,step_name:'Finance authorisation',role_name:'Finance Director',role_id:9,is_active:0,assigned_to_user_id:1},
 {id:10,step_serial_number:1,step_name:'Department review',role_name:'Department Manager',role_id:7,is_active:1,performed_by_name:'Amaka'},
 {id:20,step_serial_number:2,step_name:'Budget review',role_name:'Budget Manager',role_id:8,is_active:0,assigned_to_user_id:1}];
const workflow={is_active:1,is_completed:0,current_step_id:20,steps,permissions:{can_approve:true}};
test('Approval guide follows configured order and authoritative current step, not every assigned flag',()=>{
 const guide=workflowGuide(workflow);assert.equal(guide.current.id,20);assert.equal(guide.previous.id,10);assert.equal(guide.next.id,30);
 assert.equal(workflowStage(guide,steps[0]),'next');assert.equal(workflowStage(guide,steps[1]),'completed');assert.equal(workflowStage(guide,steps[2]),'current');
});
test('Pending escalation holds the current stage and does not approve or advance the normal workflow',()=>{
 const guide=workflowGuide({...workflow,escalation:{state:'pending'}});assert.equal(guide.current.id,20);assert.equal(guide.next.id,30);assert.equal(workflowStage(guide,steps[2]),'escalated');
});
test('A resolved escalation and historical return comments do not colour the current stage as rejected or escalated',()=>{
 const changed={...workflow,escalation:{state:'resolved'},steps:steps.map(s=>({...s,rejection_comments:'Earlier return',escalated_at:'2026-10-01'}))};
 const guide=workflowGuide(changed);assert.equal(workflowStage(guide,guide.current),'current');assert.equal(guide.escalated,false);
});
test('Completed and cancelled workflows have no current or next approver',()=>{
 for(const changes of [{is_completed:'1'},{is_active:'0',cancelled_at:'2026-10-29 12:00:00'}]){const guide=workflowGuide({...workflow,...changes});assert.equal(guide.current,null);assert.equal(guide.next,null);}
});
test('A missing current step does not invent ownership from stale assignment flags',()=>{
 const guide=workflowGuide({...workflow,current_step_id:999});assert.equal(guide.current,null);assert.equal(guide.next,null);
});
test('Restored coloured sidebar names the current and next roles, and never mistakes a routing flag for a person',()=>{
 const Sidebar=load('src/components/approvals/StepsSidebar.jsx').default;
 const html=renderToStaticMarkup(React.createElement(Sidebar,{workflow,steps,role_id:8}));
 assert.match(html,/With now/);assert.match(html,/Budget Manager/);assert.match(html,/Next after approval/);assert.match(html,/Finance Director/);assert.match(html,/aria-current="step"/);
 assert.match(html,/bg-green-50/);assert.match(html,/bg-blue-50/);assert.match(html,/bg-violet-50/);assert.doesNotMatch(html,/User #1|Assigned: User/);
});
test('Escalation sidebar explains who has it and that the original approver resumes',()=>{
 const Sidebar=load('src/components/approvals/StepsSidebar.jsx').default;
 const html=renderToStaticMarkup(React.createElement(Sidebar,{workflow:{...workflow,escalation:{state:'pending'}},steps,role_id:8}));
 assert.match(html,/With escalation reviewer/);assert.match(html,/Returns to the original approver/);assert.match(html,/bg-amber-50/);
});
test('Original dashboard page content is preserved exactly, with the analytics added underneath',()=>{
 for(const relative of ['src/pages/Dashboard/Home.tsx','src/pages/Dashboard/Dashboard.tsx']){
  const originalHashes={"src/pages/Dashboard/Home.tsx": "56f647b61361f0cc449671ecab46fa9943b45db01ff389d1bdb1cab4b68a11e2", "src/pages/Dashboard/Dashboard.tsx": "1c3ce24248613a46f3aba057304a3b0a25cf06a811d442d8b6bc495993eb2696"};
  let restored=fs.readFileSync(path.join(root,relative),'utf8').replace(/\r\n/g,'\n');
  restored=restored.replace(/^import DashboardOverview.*\n/m,'').replace('\n        {/* Additional accounting data; the original dashboard stays above. */}\n        <DashboardOverview />\n','').replace('\n        <div className="col-span-12">\n          <DashboardOverview />\n        </div>\n','');
  assert.equal(crypto.createHash('sha256').update(restored).digest('hex'),originalHashes[relative],relative);
 }
 const sidebar=fs.readFileSync(path.join(root,'src/layout/AppSidebar.tsx'),'utf8');assert.match(sidebar,/name: "Dashboard",[\s\S]*?path: "\/"/);
 const app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');assert.match(app,/<Welcome \/><DashboardOverview \/>/);
});

test('Read-only users do not receive a misleading Your Turn action badge',()=>{
 const Sidebar=load('src/components/approvals/StepsSidebar.jsx').default;
 const html=renderToStaticMarkup(React.createElement(Sidebar,{workflow:{...workflow,permissions:{}},steps,role_id:8}));
 assert.doesNotMatch(html,/Your Turn/);assert.match(html,/Your selected role/);
});

test('Phone workflow guidance remains a side drawer alongside the separate desktop sidebar',()=>{
 const page=fs.readFileSync(path.join(root,'src/pages/Procurement/ApprovalCenterDetails.jsx'),'utf8');
 assert.match(page,/<WorkflowDrawer/);assert.match(page,/aria-label="Workflow stages and next approver"/);
 const Drawer=load('src/components/approvals/WorkflowDrawer.jsx').default;
 const html=renderToStaticMarkup(React.createElement(Drawer,{currentOwner:'Department Manager'},React.createElement('p',null,'Workflow stages')));
 assert.match(html,/<dialog/);assert.match(html,/aria-modal="true"/);assert.match(html,/right-0/);assert.match(html,/Workflow Steps/);assert.match(html,/Close workflow steps/);
});
