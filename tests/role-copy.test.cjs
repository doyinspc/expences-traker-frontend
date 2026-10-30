const { test }=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..'),React=require(path.join(root,'node_modules/react')),{transformSync}=require(path.join(root,'node_modules/esbuild'));
function load(relative,mocks={}){const filename=path.join(root,relative),module={exports:{}};const code=transformSync(fs.readFileSync(filename,'utf8'),{format:'cjs',jsx:'automatic',loader:/tsx$/.test(relative)?'tsx':/jsx$/.test(relative)?'jsx':/ts$/.test(relative)?'ts':'js'}).code;const localRequire=id=>{if(id in mocks)return mocks[id];if(id.startsWith('.')){let resolved=path.resolve(path.dirname(filename),id);if(!path.extname(resolved))resolved=['.js','.jsx','.ts','.tsx'].map(ext=>resolved+ext).find(p=>fs.existsSync(p));return load(path.relative(root,resolved),mocks);}return require(require.resolve(id,{paths:[root]}));};vm.runInNewContext(code,{module,exports:module.exports,require:localRequire,console,FormData,document:{getElementById:()=>({focus(){}})}});return module.exports;}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);if(!tree||typeof tree!=='object')return [];return [tree,...nodes(tree.props?.children)];}
function words(tree){if(Array.isArray(tree))return tree.map(words).join('');if(tree==null||tree===false)return '';if(typeof tree!=='object')return String(tree);return words(tree.props?.children);}
function harness(file,props,mocks={}){let cursor=0,states=[],tree;const hookReact={...React,useState:initial=>{const id=cursor++;if(!(id in states))states[id]=typeof initial==='function'?initial():initial;return [states[id],value=>{states[id]=typeof value==='function'?value(states[id]):value;}];}};const Component=load(file,{react:hookReact,...mocks}).default;const h={render(next){if(next)props=next;cursor=0;tree=Component(props);return tree;},find(fn){return nodes(tree).find(fn);},text(){return words(tree);},change(id,value){h.find(n=>n.type==='input'&&n.props.id===id).props.onChange({target:{value}});h.render();},async submit(){await h.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();},click(label){const node=h.find(n=>n.type==='button'&&words(n)===label);assert.ok(node,'Missing button '+label);node.props.onClick();h.render();},props:()=>props};h.render();return h;}

const plan={source:{staff_name:'Taylor Demo',role_name:'Finance Director',location_name:'Lagos HQ'},locations:[
 {id:42,name:'Abuja School',code:'ABJ',already_assigned:false},
 {id:43,name:'Kano School',code:'KAN',already_assigned:false},
 {id:44,name:'Ibadan School',already_assigned:true,inactive_assignment:false},
 {id:45,name:'Enugu School',already_assigned:true,inactive_assignment:true}
]};
function rolePanel(handler=async()=>({data:{success:true,data:{created:2,skipped:0}}}),queryError=null){
 const calls=[];let queryConfig;
 const h=harness('src/pages/Teams/UserComponents/RoleCopyPanel.jsx',{staffId:22,source:{id:100,itemname2:'Finance Director'},scopeKey:'fixture-school-41',onClose(){calls.push('closed');},onCopied(){calls.push('refreshed');}}, {
  '@tanstack/react-query':{useQuery:config=>{queryConfig=config;return {data:queryError?null:plan,isPending:false,error:queryError,refetch:async()=>{calls.push('reloaded');}};}},
  axios:{post:async(...args)=>{calls.push(args);return handler(...args);},get:async(...args)=>{calls.push(args);return {data:{success:true,data:plan}};}},
  '../../../actions/common':{API_PATH_SETTING:'/synthetic-api',axiosConfig:{},tokenHelpers:{getTenantDb:()=> 'fixture',getToken:()=> 'synthetic-session'}}
 });
 h.select=(name,checked=true)=>{const label=h.find(n=>n.type==='label'&&words(n).includes(name));assert.ok(label);const input=nodes(label).find(n=>n.type==='input'&&n.props.type==='checkbox');input.props.onChange({target:{checked}});h.render();};
 h.search=value=>{h.find(n=>n.type==='input'&&n.props.type==='search').props.onChange({target:{value}});h.render();};
 return {h,calls,query:()=>queryConfig};
}
test('Role-copy preview shows staff, source school and same role, and preserves separation from module access',()=>{
 const {h,calls}=rolePanel();assert.match(h.text(),/Taylor Demo.*Finance Director.*Lagos HQ/);assert.match(h.text(),/does not create a new role/);assert.match(h.text(),/copy module permissions/);assert.match(h.text(),/Inactive assignment exists/);assert.equal(calls.length,0);
});
test('Already assigned and inactive roles are disabled in the destination picker',()=>{
 const {h}=rolePanel();const checkboxes=nodes(h.render()).filter(n=>n.type==='input'&&n.props.type==='checkbox');assert.equal(checkboxes.filter(n=>n.props.disabled).length,2);assert.equal(checkboxes.filter(n=>n.props.checked).length,2);
});
test('Selecting and reviewing schools never writes before explicit confirmation',()=>{
 const {h,calls}=rolePanel();h.select('Abuja School');h.select('Kano School');h.click('Review selected locations (2)');assert.match(h.text(),/Review 2 selected location/);assert.match(h.text(),/Abuja School/);assert.match(h.text(),/Kano School/);assert.equal(calls.length,0);h.click('Back to location selection');assert.equal(calls.length,0);
});
test('Confirmed copying sends only reviewed staff assignment and destination IDs',async()=>{
 const {h,calls}=rolePanel();h.select('Abuja School');h.select('Kano School');h.click('Review selected locations (2)');await h.find(n=>n.type==='button'&&words(n)==='Confirm copy role').props.onClick();h.render();const body=calls[0][1];assert.equal(body.cat,'copyRoleAssignments');assert.equal(body.user_id,22);assert.equal(body.source_assignment_id,100);assert.deepEqual(Array.from(body.target_location_ids),[42,43]);assert.equal(body.confirmation,'COPY_ROLE_ASSIGNMENTS');assert.ok(calls.includes('refreshed'));assert.match(h.text(),/2 location\(s\) added/);assert.equal(h.find(n=>n.type==='button'&&words(n)==='Review selected locations (0)').props.disabled,true);
});
test('Select available search results excludes existing roles and does not select hidden schools',()=>{
 const {h}=rolePanel();h.search('Abuja');h.click('Select available results');h.click('Select available results');h.search('');h.click('Review selected locations (1)');const review=h.find(n=>n.type==='ul');assert.match(words(review),/Abuja School/);assert.doesNotMatch(words(review),/Kano|Ibadan|Enugu/);
});
test('Empty role selection cannot advance to confirmation and can be cancelled safely',()=>{
 const {h,calls}=rolePanel();assert.equal(h.find(n=>n.type==='button'&&words(n)==='Review selected locations (0)').props.disabled,true);h.select('Abuja School');h.click('Clear selection');assert.equal(h.find(n=>n.type==='button'&&words(n)==='Review selected locations (0)').props.disabled,true);h.click('Close role copy');assert.deepEqual(calls,['closed']);
});
test('Permission failure leaves the reviewed locations available for correction without success claims',async()=>{
 const {h,calls}=rolePanel(async()=>({data:{success:false,message:'This school is outside your access.'}}));h.select('Abuja School');h.click('Review selected locations (1)');await h.find(n=>n.type==='button'&&words(n)==='Confirm copy role').props.onClick();h.render();assert.match(h.text(),/outside your access/);assert.ok(h.find(n=>n.type==='button'&&words(n)==='Confirm copy role'));assert.ok(!calls.includes('refreshed'));assert.doesNotMatch(h.text(),/location\(s\) added/);
});
test('A failed target-list read reports the reason instead of presenting an empty permission list',()=>{
 const {h}=rolePanel(undefined,{message:'Full user-management access is required.'});assert.match(h.text(),/Full user-management access/);assert.ok(h.find(n=>n.type==='button'&&words(n)==='Try again'));
});
test('Role preview uses authenticated reads and isolates cache entries by school, staff, tenant and session',async()=>{
 const {query,calls}=rolePanel();await query().queryFn();const params=calls[0][1].params;assert.equal(params.cat,'getRoleCopyTargets');assert.deepEqual(JSON.parse(params.data),{user_id:22,source_assignment_id:100});assert.deepEqual(Array.from(query().queryKey),['role-copy-targets','fixture','synthetic-session','fixture-school-41',22,100]);
});
test('The added role action preserves existing controls and resets its review when staff, source or session changes',()=>{
 const source=fs.readFileSync(path.join(root,'src/pages/Teams/UserComponents/UserRolePage.tsx'),'utf8');assert.match(source,/<FullSettingActionDeleteMinimal \{\.\.\.props\}/);assert.match(source,/key=\{`\$\{userid\}-\$\{copySource.id\}-\$\{scopeKey\}`\}/);assert.match(source,/tokenHelpers.getToken\(\)/);assert.match(source,/canCopyRoles && Number\(props.row\?\.is_active\) === 1/);
});
