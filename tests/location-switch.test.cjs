const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),{transformSync}=require('esbuild');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const filename=path.join(root,'src/pages/Dashboard/Location.tsx');
const source=fs.readFileSync(filename,'utf8');
const tree=ts.createSourceFile(filename,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const landing=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='Landing');
const renderReturn=landing.body.statements.find(ts.isReturnStatement);
// Exercise the real component handlers with React's deferred state-update semantics.
const handlers=source.slice(landing.body.getStart(tree)+1,renderReturn.getStart(tree));
const code=transformSync('export default function Landing(){'+handlers+'return {selectedLocation,selectedRole,showRoleSelection,getRolesForLocation,handleSelectLocation,handleSelectRole};}',{loader:'tsx',format:'cjs'}).code;
function setup(roles){
 const a={id:'41',name:'Lagos'},b={id:'42',name:'Abuja'},c={id:'43',name:'Kano'};
 const auth={locations:[a,b,c],location:a,role:roles.find(r=>String(r.location_id)==='41'),roles};
 const states=[],actions=[];let cursor=0;
 const module={exports:{}};
 const dispatch=action=>{actions.push(action);if(action.type==='location')auth.location=action.payload;else auth.role=action.payload;};
 vm.runInNewContext(code,{module,exports:module.exports,useDispatch:()=>dispatch,useSelector:fn=>fn({auth}),useState:initial=>{const index=cursor++;if(!(index in states))states[index]=initial;return [states[index],value=>{states[index]=value;}];},authActions:{tenantSwitchLocation:payload=>({type:'location',payload}),tenantSwitchRole:payload=>({type:'role',payload})},setTimeout:fn=>fn()});
 const render=()=>{cursor=0;return module.exports.default();};
 return {a,b,c,auth,actions,render};
}
const oldRole={id:7,location_id:'41',name:'Lagos manager'};
test('A location with one role switches to the clicked location on the first attempt',()=>{
 const role={id:9,location_id:'42',name:'Abuja manager'},s=setup([oldRole,role]);
 s.render().handleSelectLocation(s.b);
 assert.equal(s.auth.location.id,'42');assert.equal(s.auth.role.id,9);
 assert.equal(s.actions.length,2);assert.equal(s.render().showRoleSelection,false);
});
test('Role lookup accepts numeric location IDs returned by the API and string IDs in saved selection',()=>{
 const role={id:9,location_id:42,name:'Abuja manager'},s=setup([oldRole,role]);
 s.render().handleSelectLocation(s.b);assert.equal(s.auth.location.id,'42');assert.equal(s.auth.role.id,9);
});
test('A location with several roles waits for one choice and then switches once',()=>{
 const one={id:9,location_id:'42'},two={id:10,location_id:'42'},s=setup([oldRole,one,two]);
 s.render().handleSelectLocation(s.b);assert.equal(s.actions.length,0);
 const pending=s.render();assert.equal(pending.selectedRole,null);assert.equal(pending.showRoleSelection,true);
 pending.handleSelectRole(two);assert.equal(s.auth.location.id,'42');assert.equal(s.auth.role.id,10);
 assert.equal(s.actions.length,2);assert.equal(s.render().showRoleSelection,false);
});
test('A location with no assigned role does not reuse the previous location role',()=>{
 const s=setup([oldRole]);s.render().handleSelectLocation(s.b);
 assert.equal(s.actions.length,0);assert.equal(s.render().selectedRole,null);
});
test('A role belonging to another location cannot be applied to the pending location',()=>{
 const s=setup([oldRole,{id:9,location_id:'42'},{id:10,location_id:'42'}]);
 s.render().handleSelectLocation(s.b);s.render().handleSelectRole(oldRole);assert.equal(s.actions.length,0);
});
test('Consecutive single-role location switches do not lag one location behind',()=>{
 const s=setup([oldRole,{id:9,location_id:'42'},{id:11,location_id:'43'}]);
 s.render().handleSelectLocation(s.b);s.render().handleSelectLocation(s.c);
 assert.equal(s.auth.location.id,'43');assert.equal(s.auth.role.id,11);
});
