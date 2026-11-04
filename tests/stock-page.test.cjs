const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..'),React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
function markup(data){
 const module={exports:{}};const code=require(path.join(root,'node_modules/esbuild')).transformSync(fs.readFileSync(path.join(root,'src/pages/Inventory/StockLedgerPanel.jsx'),'utf8'),{loader:'jsx',format:'cjs',jsx:'automatic'}).code;
 const mocks={
 '@tanstack/react-query':{useQuery:()=>({data,isPending:false,isFetching:false})},
 'react-redux':{useSelector:()=>({user:{id:21},location_id:41,role_id:110})},
 '../../actions/common':{tokenHelpers:{getTenantDb:()=> 'fixture',getToken:()=> 'fixture'}},
 '../../components/ui/Loader':()=>null,
 };
 vm.runInNewContext(code,{module,exports:module.exports,console,require:id=>id in mocks?mocks[id]:require(require.resolve(id,{paths:[root]}))});
 return renderToStaticMarkup(React.createElement(module.exports.default,{}));
}
const period={label:'FY 2026',start_date:'2026-01-01',end_date:'2026-12-31'};
test('Stock setup tells an administrator what to do before movement buttons become available',()=>{
 const html=markup({schema_ready:false,can_prepare:true});assert.match(html,/Review stock setup/);assert.match(html,/opening balance/);assert.doesNotMatch(html,/aria-label="Stock views"/);
});
test('An unconfirmed opening year shows opening controls before movement buttons',()=>{
 const html=markup({schema_ready:true,period,years:[],can_open:true,can_write:true,balances:[],items:[]});assert.match(html,/Opening balance required/);assert.doesNotMatch(html,/aria-label="Stock views"/);
});
test('A confirmed stock year exposes balance, receipt, issue and history views',()=>{
 const html=markup({schema_ready:true,period,active_period:{closed_at:null},years:[],can_write:true,balances:[],as_of:'2026-11-04'});
 for(const label of ['Balance report','Receive procurement','Issue to requisition','Movement history'])assert.ok(html.includes(label),label);
});
