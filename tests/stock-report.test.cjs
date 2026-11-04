const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const React=require(path.join(root,'node_modules/react')),{renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const moduleConfig={exports:{}};
const code=require(path.join(root,'node_modules/esbuild')).transformSync(fs.readFileSync(path.join(root,'src/pages/Reports/StockReportCharts.jsx'),'utf8'),{loader:'jsx',format:'cjs',jsx:'automatic'}).code;
vm.runInNewContext(code,{module:moduleConfig,exports:moduleConfig.exports,require:id=>require(require.resolve(id,{paths:[root]}))});
const {stockChartData,default:Charts}=moduleConfig.exports;
const rows=[
 {item_id:1,item_name:'Keyboard',category_name:'IT',unit:'pieces',opening_quantity:3,received_quantity:2,issued_quantity:5,closing_quantity:0},
 {item_id:2,item_name:'Mouse',category_name:'IT',unit:'pieces',opening_quantity:4,received_quantity:3,issued_quantity:1,closing_quantity:6},
 {item_id:3,item_name:'Ink',category_name:'IT',unit:'bottles',opening_quantity:2,received_quantity:8,issued_quantity:3,closing_quantity:7},
];
test('Stock charts separate saved units and use the same report quantities',()=>{
 const pieces=stockChartData(rows,'pieces');assert.equal(pieces.byStock.length,2);assert.equal(pieces.byStock[0].item_name,'Mouse');assert.equal(pieces.byStock[0].closing_quantity,6);assert.ok(pieces.byMovement.every(r=>r.unit==='pieces'));
 const bottles=stockChartData(rows,'bottles');assert.equal(bottles.byStock.length,1);assert.equal(bottles.byStock[0].closing_quantity,7);
});
test('Chart rankings are bounded and invalid quantities remain outside the charts',()=>{
 const many=Array.from({length:12},(_,i)=>({...rows[1],item_id:i+10,closing_quantity:i}));
 const data=stockChartData([...many,{...rows[0],closing_quantity:-1}],'pieces');assert.equal(data.byStock.length,8);assert.equal(data.total,12);assert.equal(data.excluded,1);assert.equal(data.byStock[0].closing_quantity,11);
});
test('Charts display their unit selector, item values and both intended comparisons',()=>{
 const html=renderToStaticMarkup(React.createElement(Charts,{rows}));assert.match(html,/Stock on hand by item/);assert.match(html,/Received versus issued/);assert.match(html,/Stock chart unit/);assert.match(html,/Different units stay separate/);
});
test('Stock CSV preserves every item, its unit, location and reporting period',()=>{
 const source=fs.readFileSync(path.join(root,'src/pages/Inventory/StockLedgerPanel.jsx'),'utf8');
 const start=source.indexOf('export function stockReportCsv'),end=source.indexOf('\nfunction download',start);
 const csvFn=vm.runInNewContext(source.slice(start,end).replace('export function','function')+'\nstockReportCsv');
 const csv=csvFn(rows,'FY 2026','2026-11-04','Lagos');assert.equal(csv.split('\r\n').length,4);assert.match(csv,/"Keyboard","IT","pieces","3","2","5","0","FY 2026","2026-11-04","Lagos"/);assert.match(csv,/"Ink","IT","bottles"/);
 const safe=csvFn([{...rows[0],item_name:'=1+1'}],'FY','date','Lagos');assert.match(safe,/"'=1\+1"/);
});
