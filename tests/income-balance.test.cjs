const { test }=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..'),React=require(path.join(root,'node_modules/react')),{transformSync}=require(path.join(root,'node_modules/esbuild'));
function load(relative,mocks={}){const filename=path.join(root,relative),module={exports:{}};const code=transformSync(fs.readFileSync(filename,'utf8'),{format:'cjs',jsx:'automatic',loader:/tsx$/.test(relative)?'tsx':/jsx$/.test(relative)?'jsx':/ts$/.test(relative)?'ts':'js'}).code;const localRequire=id=>{if(id in mocks)return mocks[id];if(id.startsWith('.')){let resolved=path.resolve(path.dirname(filename),id);if(!path.extname(resolved))resolved=['.js','.jsx','.ts','.tsx'].map(ext=>resolved+ext).find(p=>fs.existsSync(p));return load(path.relative(root,resolved),mocks);}return require(require.resolve(id,{paths:[root]}));};vm.runInNewContext(code,{module,exports:module.exports,require:localRequire,console,FormData,document:{getElementById:()=>({focus(){}})}});return module.exports;}
function nodes(tree){if(Array.isArray(tree))return tree.flatMap(nodes);if(!tree||typeof tree!=='object')return [];return [tree,...nodes(tree.props?.children)];}
function words(tree){if(Array.isArray(tree))return tree.map(words).join('');if(tree==null||tree===false)return '';if(typeof tree!=='object')return String(tree);return words(tree.props?.children);}
function harness(file,props,mocks={}){let cursor=0,states=[],tree;const hookReact={...React,useState:initial=>{const id=cursor++;if(!(id in states))states[id]=typeof initial==='function'?initial():initial;return [states[id],value=>{states[id]=typeof value==='function'?value(states[id]):value;}];}};const Component=load(file,{react:hookReact,...mocks}).default;const h={render(next){if(next)props=next;cursor=0;tree=Component(props);return tree;},find(fn){return nodes(tree).find(fn);},text(){return words(tree);},change(id,value){h.find(n=>n.type==='input'&&n.props.id===id).props.onChange({target:{value}});h.render();},async submit(){await h.find(n=>n.type==='form').props.onSubmit({preventDefault(){}});h.render();},click(label){const node=h.find(n=>n.type==='button'&&words(n)===label);assert.ok(node,'Missing button '+label);node.props.onClick();h.render();},props:()=>props};h.render();return h;}

const {incomeExpenseGroups,reportCents,reportDecimal,incomeExpenseCsvRows}=load('src/utils/functions/incomeExpenseReport.js');
const financialRow=(document_type,amount,extra={})=>({id:1,document_type,currency_id:650,currency_code:'NGN',resolved:1,total_amount:document_type===7?'0.00':amount,expense_amount:document_type===7?'0.00':amount,income_amount:document_type===7?amount:'0.00',credit_amount:document_type===7?amount:'0.00',category_name:'School operations',item_name:'Recorded item',account_name:'Recorded account',location_name:'Kano School',resolved_date:'2026-10-27 23:59:59',type:'0',...extra});
test('Net balance offsets procurement and cash advances with income without hiding gross expenses',()=>{
 const group=incomeExpenseGroups([financialRow(2,'300.00'),financialRow(3,'200.00'),financialRow(7,'1000.00')])[0];
 assert.deepEqual(JSON.parse(JSON.stringify(group.totals)),{income:'1000.00',procurement:'300.00',cashAdvances:'200.00',expenses:'500.00',net:'500.00'});assert.equal(group.expenses.length,2);assert.equal(group.income.length,1);
});
test('Requisitions, stock movements and both transfer legs are excluded from income/expense balances',()=>{
 const data=[financialRow(2,'100.00'),financialRow(7,'150.00'),...[1,6,6,8].map(type=>financialRow(type,'90000.00'))];
 const group=incomeExpenseGroups(data)[0];assert.equal(group.rows.length,2);assert.equal(group.totals.net,'50.00');
});
test('Dual-use catalogue flags do not turn one transaction into both income and expense',()=>{
 const group=incomeExpenseGroups([financialRow(2,'100.00',{item_expense_enabled:1,item_income_enabled:1}),financialRow(7,'250.00',{item_expense_enabled:1,item_income_enabled:1})])[0];assert.equal(group.totals.expenses,'100.00');assert.equal(group.totals.income,'250.00');assert.equal(group.totals.net,'150.00');
});
test('Different currencies retain separate income, costs and net balances',()=>{
 const groups=incomeExpenseGroups([financialRow(2,'30.00'),financialRow(7,'100.00'),financialRow(2,'2.00',{currency_id:651,currency_code:'USD'}),financialRow(7,'10.00',{currency_id:651,currency_code:'USD'})]);assert.equal(groups.length,2);assert.equal(groups[0].totals.net,'70.00');assert.equal(groups[1].totals.net,'8.00');assert.equal(groups[1].currency,'USD');
});
test('Missing currency and invalid monetary values withhold totals while preserving the records',()=>{
 for(const rows of [[financialRow(7,'10.00',{currency_id:0,currency_code:''})],[financialRow(2,'bad')]]){const group=incomeExpenseGroups(rows)[0];assert.equal(group.valid,false);assert.equal(group.totals.net,null);assert.equal(group.rows.length,1);}
});
test('Decimal arithmetic avoids fractional-cent drift and rejects unsafe amounts',()=>{
 const group=incomeExpenseGroups([financialRow(2,'0.10'),financialRow(3,'0.20'),financialRow(7,'0.30')])[0];assert.equal(group.totals.expenses,'0.30');assert.equal(group.totals.net,'0.00');assert.equal(reportCents('1e5'),null);assert.equal(reportCents('900719925474099999.00'),null);assert.equal(reportCents('1.234'),null);assert.equal(reportDecimal(-123),'-1.23');
});
test('Negative net balances remain visible and uncompleted receipts do not offset completed expenses',()=>{
 const group=incomeExpenseGroups([financialRow(2,'300.00'),financialRow(7,'100.00'),financialRow(7,'50000.00',{resolved:0})])[0];assert.equal(group.totals.net,'-200.00');assert.equal(group.income.length,1);
});
test('CSV keeps expense and income amounts separate, signed contributions and saved classification links',()=>{
 const rows=incomeExpenseCsvRows([financialRow(2,'100.00'),financialRow(7,'150.00'),financialRow(6,'100000.00')]);assert.equal(rows.length,2);assert.equal(rows[0][3],'Procurement');assert.equal(rows[0][9],'100.00');assert.equal(rows[0][10],'0.00');assert.equal(rows[0][11],'-100.00');assert.equal(rows[1][9],'0.00');assert.equal(rows[1][10],'150.00');assert.equal(rows[1][11],'150.00');assert.equal(rows[1][5],'Income');assert.equal(rows[1][6],'2026-10-27 23:59:59');assert.equal(rows[1][7],'Kano School');
});
const {renderToStaticMarkup:renderFinance}=require(path.join(root,'node_modules/react-dom/server'));
function financeMarkup(data){const Balance=load('src/pages/Reports/IncomeExpenseBalance.jsx',{'../../actions/common':{isArrayWithValue:rows=>Array.isArray(rows)&&rows.length>0}}).default;return renderFinance(React.createElement(Balance,{data,onExport(){}}));}
test('Income balance is added above the preserved expense summary, category table and export control',()=>{
 const html=financeMarkup([financialRow(2,'100.00'),financialRow(7,'150.00')]);assert.match(html,/Income and expense balance/);assert.match(html,/Net balance/);assert.match(html,/Expense Summary/);assert.match(html,/Export CSV/);assert.match(html,/Income entries \(1\)/);assert.match(html,/School operations/);assert.match(html,/View School operations expense details/);
});
test('The report identifies missing currency rather than labelling every amount as naira',()=>{
 const html=financeMarkup([financialRow(2,'100.00',{currency_id:0,currency_code:''})]);assert.match(html,/Currency not set/);assert.match(html,/Monetary totals are withheld/);assert.doesNotMatch(html,/NGN|₦/);
});
test('Numeric source types render searchable document names and the actual completion date',()=>{
 const Details=load('src/pages/Reports/ExpenseDetails.jsx').default;const html=renderFinance(React.createElement(Details,{items:[financialRow(2,'100.00')],currency:'NGN'}));assert.match(html,/Procurement/);assert.match(html,/2026/);assert.match(html,/OPEX/);
});
test('Income-only reports show the net balance and income entries without implying an expense or CAPEX entry',()=>{
 const html=financeMarkup([financialRow(7,'150.00')]);assert.match(html,/Income entries \(1\)/);assert.match(html,/No expense entries/);assert.doesNotMatch(html,/>CAPEX</);
});

test('Older backend responses retain the original expense summary and request an update instead of claiming zero income',()=>{
 const row=financialRow(2,'100.00');delete row.expense_amount;delete row.income_amount;
 const html=financeMarkup([row]);assert.match(html,/Install the matching backend update/);assert.match(html,/Expense Summary/);assert.doesNotMatch(html,/Net balance/);
});
test('The original CSV columns remain present with the balance columns appended',()=>{
 const page=fs.readFileSync(path.join(root,'src/pages/Reports/ExpenseReport.jsx'),'utf8');assert.match(page,/\['Category','Item','Account','Document Type','Total Amount','Type','Date','Location','Currency','Expense Amount','Income Amount','Net Contribution'\]/);
});
