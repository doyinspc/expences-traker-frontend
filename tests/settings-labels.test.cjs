const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const code=require(path.join(root,'node_modules/esbuild')).buildSync({entryPoints:[path.join(root,'src/utils/functions/tableBuilder.ts')],bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent',packages:'external'}).outputFiles[0].text;
const moduleConfig={exports:{}};
vm.runInNewContext(code,{module:moduleConfig,exports:moduleConfig.exports,require:id=>require(require.resolve(id,{paths:[root]})),console});
const {buildTableDataFromMapping,buildColumnVisibility}=moduleConfig.exports;
for(const [table,pairs] of Object.entries({
 workflows:[['item_id1','item_name1'],['item_id2','item_name2']],
 workflowsteps:[['item_id1','item_name1'],['text_5','escalation_role_name']],
 workflowstatus:[['item_id1','item_name1']],approvalactions:[['item_id1','item_name1']],documentstatus:[['item_id1','item_name1']],
}))test(`${table}: show reference names while keeping identifier columns hidden`,()=>{
 const columns=buildTableDataFromMapping(table),visibility=buildColumnVisibility(table);
 for(const [id,name] of pairs){assert.ok(columns.some(c=>c.name===name&&c.showTable),name+' missing');assert.ok(!columns.some(c=>c.name===id&&c.showTable),id+' exposed');assert.equal(visibility[name],true);assert.equal(visibility[id],false);}
});
test('Workflow step numbers and expected days stay numeric; unrelated hidden fields stay hidden',()=>{
 const columns=buildTableDataFromMapping('workflowsteps');
 for(const name of ['item_id2','item_id3'])assert.ok(columns.some(c=>c.name===name&&c.showTable));
 for(const name of ['created_at','parent_id','parent_name'])assert.ok(!columns.some(c=>c.name===name&&c.showTable),name+' exposed');
 const users=buildTableDataFromMapping('users');assert.ok(!users.some(c=>c.name==='password'&&c.showTable));
});
