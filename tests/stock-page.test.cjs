const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..'),React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {pathToFileURL}=require('node:url');
const labels=import(pathToFileURL(path.join(root,'src/utils/functions/workflowPresentation.js')).href);
let workflowPresentation;
test.before(async()=>{workflowPresentation=await labels;});
function markup(data,props={},activeView){
 const module={exports:{}};const code=require(path.join(root,'node_modules/esbuild')).transformSync(fs.readFileSync(path.join(root,'src/pages/Inventory/StockLedgerPanel.jsx'),'utf8'),{loader:'jsx',format:'cjs',jsx:'automatic'}).code;
 const mocks={
 react:{...React,useState:initial=>React.useState(activeView&&initial==='issue'?activeView:initial)},
 '@tanstack/react-query':{useQuery:options=>{
   if(activeView==='opening')assert.equal(options.queryKey[4],'receipt');
   else if(!props.reportOnly)assert.equal(options.queryKey[4],'issue');
   return {data,isPending:false,isFetching:false};
 }},
 'react-redux':{useSelector:()=>({user:{id:21},location_id:41,role_id:110})},
 '../../actions/common':{tokenHelpers:{getTenantDb:()=> 'fixture',getToken:()=> 'fixture'}},
 '../../components/ui/Loader':()=>null,
 '../../utils/functions/workflowPresentation':workflowPresentation,
 '../../components/procurement/ItemEvidencePanel':()=>null,
 '../Reports/StockReportCharts':()=>React.createElement('section',null,'Stock charts'),
 };
 vm.runInNewContext(code,{module,exports:module.exports,console,require:id=>id in mocks?mocks[id]:require(require.resolve(id,{paths:[root]}))});
 return renderToStaticMarkup(React.createElement(module.exports.default,props));
}
const period={label:'FY 2026',start_date:'2026-01-01',end_date:'2026-12-31'};
test('Stock setup tells an administrator what to do before movement buttons become available',()=>{
 const html=markup({schema_ready:false,can_prepare:true});assert.match(html,/Review stock setup/);assert.match(html,/opening balance/);assert.doesNotMatch(html,/aria-label="Stock views"/);
});
test('Approved Goods can be reviewed before opening without showing a verified stock balance',()=>{
 const html=markup({schema_ready:true,period,years:[],can_open:true,can_write:true,can_review:true,rows:[],
   candidates:[{id:8,document_id:11,item_id:502,item_name:'Keyboards',title:'IT equipment',unit:'pieces',
     quantity:6,requested_quantity:5,remaining_quantity:6,stock_review_id:4,stock_review_stage_id:10}]});
 assert.match(html,/Approved stock requisitions/);
 assert.match(html,/IT equipment/);
 assert.match(html,/>Review Keyboards<\/button>/);
 assert.doesNotMatch(html,/disabled=""[^>]*>Review Keyboards/);
 assert.match(html,/Requested 5/);
 assert.match(html,/Opening stock unconfirmed/);
 assert.match(html,/>Opening stock<\/button>/);
 assert.doesNotMatch(html,/0 on hand|Review stock issue/);
});
test('Opening stock offers a category filter and uses the child item ID and unit for entries',()=>{
 const html=markup({schema_ready:true,period,years:[],can_open:true,items:[
   {id:502,category_id:501,category_name:'IT equipment',name:'Keyboard',unit:'pieces'},
   {id:509,category_id:501,category_name:'IT equipment',name:'Mouse',unit:'pieces'},
 ]},{},'opening');
 assert.match(html,/Opening balance required/);
 assert.match(html,/<option value="501">IT equipment<\/option>/);
 const picker=html.match(/<select aria-label="Opening stock item"[\s\S]*?<\/select>/)?.[0];
 assert.match(picker,/<option value="502">Keyboard · pieces · IT equipment<\/option>/);
 assert.match(picker,/<option value="509">Mouse · pieces · IT equipment<\/option>/);
 assert.doesNotMatch(picker,/<option value="501">/);
});
test('A confirmed stock year exposes balance, receipt, issue and history views',()=>{
 const html=markup({schema_ready:true,period,active_period:{closed_at:null},years:[],can_write:true,balances:[],as_of:'2026-11-04'});
 for(const label of ['Balance report','Receive procurement','Issue to requisition','Movement history'])assert.ok(html.includes(label),label);
});

test('Stock menu opens stock operations without the unused document-creation form',()=>{
 const module={exports:{}};const code=require(path.join(root,'node_modules/esbuild')).transformSync(fs.readFileSync(path.join(root,'src/pages/Product/Stock.jsx'),'utf8'),{loader:'jsx',format:'cjs',jsx:'automatic'}).code;
 const mocks={
 '../../components/common/PageBreadCrumb':props=>React.createElement('h1',null,props.pageTitle),
 '../Inventory/StockLedgerPanel':()=>React.createElement('section',null,'Opening balances, receipts, issues and reports'),
 };
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>id in mocks?mocks[id]:require(require.resolve(id,{paths:[root]}))});
 const html=renderToStaticMarkup(React.createElement(module.exports.default));
 assert.match(html,/<h1>Stock<\/h1>/);assert.match(html,/Opening balances, receipts, issues and reports/);assert.doesNotMatch(html,/Stock documents|Create|Requisition Type/);
});

test('Stock report allows reviewing and exporting without receipt or issue actions',()=>{
 const html=markup({schema_ready:true,period,active_period:{closed_at:null},years:[],can_write:true,rows:[],as_of:'2026-11-04'}, {reportOnly:true});
 assert.match(html,/Balance report/);assert.match(html,/Movement history/);assert.match(html,/Export stock report/);assert.match(html,/Stock charts/);assert.doesNotMatch(html,/>Receive procurement<|>Issue to requisition</);
});
test('Report-only readers cannot open stock setup or enter opening quantities',()=>{
 assert.doesNotMatch(markup({schema_ready:false,can_prepare:true},{reportOnly:true}),/Review stock setup/);
 const html=markup({schema_ready:true,period,years:[],can_open:true,items:[]},{reportOnly:true});assert.match(html,/Open Stock under Requests/);assert.doesNotMatch(html,/Opening stock item|Review zero opening balance/);
});
