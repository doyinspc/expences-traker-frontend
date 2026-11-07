const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const React=require('react'),{transformSync}=require('esbuild');
const root=path.resolve(__dirname,'..');
function harness(){
  let cursor=0,effects=[];const states=[],deps=[];
  const hooks={...React,
    useState(initial){const i=cursor++;if(!(i in states))states[i]=typeof initial==='function'?initial():initial;return [states[i],value=>{states[i]=typeof value==='function'?value(states[i]):value;}];},
    useEffect(effect,next){const i=cursor++;if(!deps[i]||!next||next.some((v,j)=>!Object.is(v,deps[i][j]))){deps[i]=next;effects.push(effect);}},
    useMemo:fn=>fn(),useCallback:fn=>fn,useRef:value=>({current:value})};
  return {hooks,render(fn){cursor=0;const result=fn();const pending=effects;effects=[];pending.forEach(fn=>fn());return result;}};
}
function load(file,mocks){
  const module={exports:{}};
  const source=fs.readFileSync(path.join(root,file),'utf8').replace(/import\.meta\.env\.VITE_APP_TENANT_DB/g,"'test_tenant'");
  const code=transformSync(source,{loader:file.endsWith('jsx')?'jsx':'js',format:'cjs',jsx:'automatic'}).code;
  vm.runInNewContext(code,{module,exports:module.exports,console,FormData,requestAnimationFrame:fn=>fn(),sessionStorage:{getItem:()=>null},document:{querySelector:()=>null},require:id=>{
    if(id in mocks)return mocks[id];
    if(id.endsWith('.css'))return {};
    if(id.startsWith('.')){
      let target=path.resolve(path.dirname(path.join(root,file)),id);
      if(!path.extname(target))target=['.js','.jsx'].map(ext=>target+ext).find(fs.existsSync);
      return load(path.relative(root,target),mocks);
    }
    return require(id);
  }});return module.exports.default;
}
function find(tree,predicate){
  if(!tree||typeof tree!=='object')return null;
  if(predicate(tree))return tree;
  for(const child of React.Children.toArray(tree.props?.children)){const hit=find(child,predicate);if(hit)return hit;}
  return null;
}
function named(tree,name){const node=find(tree,n=>n.props?.name===name);assert.ok(node,`missing ${name}`);return node;}
function queryHarness(){
  const h=harness(),requests=[],queries=[];
  const mocks={react:h.hooks,'react-redux':{useSelector:fn=>fn({auth:{location_id:25,role_id:7}})},
    '../actions/common':{API_PATH_SETTING:'/test-api',axiosConfig:{},axiosConfig1:{},tokenHelpers:{getToken:()=> 'test'}},
    axios:{get:async(url,config)=>{requests.push(config.params);return {data:[]};}},'react-hot-toast':()=>{},
    '@tanstack/react-query':{useQueryClient:()=>({removeQueries(){},invalidateQueries(){}}),useMutation:()=>({}),useQuery:options=>{queries.push(options);return {data:[],refetch(){}};}}};
  const hook=load('src/hooks/useTanstackQuery.js',mocks);
  const render=props=>h.render(()=>hook(props));
  return {render,queries,requests};
}
test('A query disabled during parent loading starts real API reads when the parent becomes ready',async()=>{
  for(const config of [{table:'commons',mainParam:{grp:7,is_active:1}},{table:'expenses',queryType:'getRowsWithChildrenStructuredExpense',mainParam:{grp:5,is_active:1}}]){
    const h=queryHarness(),props={queryType:'gets',...config,enabled:false};
    h.render(props);assert.equal(h.queries.at(-1).enabled,false);assert.equal(h.requests.length,0);
    h.render({...props,enabled:true});h.render({...props,enabled:true});
    assert.equal(h.queries.at(-1).enabled,true);
    await h.queries.at(-1).queryFn();
    assert.equal(h.requests[0].table,config.table);
    assert.equal(h.requests[0].cat,config.queryType||'gets');
    assert.deepEqual(JSON.parse(h.requests[0].data),config.mainParam);
    h.render({...props,enabled:false});h.render({...props,enabled:false});assert.equal(h.queries.at(-1).enabled,false);
  }
});
test('Manual query loading and stopping still work with unchanged props',()=>{
  const h=queryHarness(),props={table:'commons',enabled:false};let result=h.render(props);
  result.loadQuery({grp:4});result=h.render(props);assert.equal(h.queries.at(-1).enabled,true);
  result.killQuery();h.render(props);assert.equal(h.queries.at(-1).enabled,false);
});
function formHarness(initialData,priceFree=true){
  const h=harness(),reads=[],saved=[];
  const options=[{id:5,name:'IT equipment',children:[{id:51,name:'Keyboard',text_1:'pieces',unit_price:300},{id:52,name:'Mouse',text_1:'pieces'},{id:53,name:'Fence repair',text_1:'visits',stockable:0}]}];
  const queries=[];
  const Form=load('src/pages/Product/RequistiontemForm.jsx',{
    react:h.hooks,axios:{},'react-datepicker':()=>null,
    '../../actions/common':{},'react-redux':{useSelector:fn=>fn({auth:{tenantDb:'test'}})},
    '../../hooks/useTanstackQuery':config=>{queries.push(config);return {data:options,loadQuery:()=>reads.push(config),isLoading:false};}
  });
  const props={requisitionId:90,parent_row:{requisition_type:1},initialData,priceFree,onSave:value=>saved.push(value)};
  return {render:()=>h.render(()=>Form(props)),saved,reads,queries};
}
test('Original add-item form requests structured categories and filters item options after a category is chosen',()=>{
  const h=formHarness();let tree=h.render();
  assert.equal(h.reads.length,1);assert.equal(h.reads[0].table,'expenses');
  assert.equal(h.reads[0].queryType,'getRowsWithChildrenStructuredExpense');
  assert.equal(named(tree,'item_id').props.disabled,true);
  named(tree,'category_id').props.onChange({target:{value:'5'}});tree=h.render();
  assert.equal(named(tree,'item_id').props.disabled,false);
  assert.ok(find(named(tree,'item_id'),n=>n.type==='option'&&React.Children.toArray(n.props.children).join('')==='Keyboard'));
  assert.ok(named(tree,'special_instructions'));assert.ok(named(tree,'is_type'));
  assert.equal(find(tree,n=>n.props?.name==='account_id'),null);
  assert.equal(find(tree,n=>n.props?.name==='unit_price'),null);
  assert.equal(find(tree,n=>n.props?.name==='total_price'),null);
});
test('Adding demand preserves description, CAPEX and quantity without an account while sending zero new prices',()=>{
  const h=formHarness();let tree=h.render();
  const change=(name,value,type='select-one')=>{named(tree,name).props.onChange({target:{name,value,type}});tree=h.render();};
  change('category_id','5');change('item_id','51');change('is_type','1');change('quantity','5','number');change('special_instructions','  Wireless keyboard with number pad  ','textarea');
  tree.props.onSubmit({preventDefault(){}});
  assert.equal(h.saved.length,1);const value=h.saved[0];
  assert.equal(value.category_id,5);assert.equal(Number(value.item_id),51);assert.equal(value.is_type,1);assert.equal(value.quantity,5);assert.equal('account_id' in value,false);
  assert.equal(value.special_instructions,'Wireless keyboard with number pad');assert.equal(value.unit_price,'0.00');assert.equal(value.total_price,'0.00');
});
test('Service forms require scope and do not submit a stock quantity',()=>{
  const h=formHarness({category_id:5,item_id:53});
  let tree=h.render();
  assert.equal(find(tree,node=>node.props?.name==='quantity'),null);
  assert.equal(named(tree,'special_instructions').props.required,true);
  tree.props.onSubmit({preventDefault(){}});
  assert.equal(h.saved.length,0);
  named(tree,'special_instructions').props.onChange({target:{name:'special_instructions',value:'Repair fence in two days',type:'textarea'}});
  tree=h.render();
  tree.props.onSubmit({preventDefault(){}});
  assert.equal(h.saved.length,1);
  assert.equal(h.saved[0].special_instructions,'Repair fence in two days');
  assert.equal('quantity' in h.saved[0],false);
});
test('Editing existing demand retains date and OPEX without erasing historical prices',()=>{
  const h=formHarness({id:41,category_id:5,item_id:51,account_id:7,is_type:0,quantity:3,special_instructions:'Original description',delivery_required_by:'2026-11-20',unit_price:90,total_price:270});
  const tree=h.render();tree.props.onSubmit({preventDefault(){}});assert.equal(h.saved.length,1);
  const value=h.saved[0];assert.equal(value.is_type,0);assert.equal(value.special_instructions,'Original description');assert.equal(value.delivery_required_by.toISOString().slice(0,10),'2026-11-20');assert.equal('unit_price' in value,false);assert.equal('total_price' in value,false);
});
test('Invalid catalogue selection cannot save an empty requisition line',()=>{
  const h=formHarness({category_id:5,item_id:999,account_id:999,quantity:1});const tree=h.render();tree.props.onSubmit({preventDefault(){}});assert.equal(h.saved.length,0);
});
test('Priced documents keep the original unit and total price controls',()=>{
  const h=formHarness({category_id:5,item_id:51,account_id:7,quantity:2,unit_price:10,total_price:20},false);const tree=h.render();assert.ok(named(tree,'unit_price'));assert.ok(named(tree,'total_price'));
});

test('The actual requisition page waits for its parent, opens the original form and saves against that parent',async()=>{
  const h=harness(),writes=[],configurations=[];
  let parent={isPending:true};
  const Page=load('src/pages/Product/RequisitionDemandItems.jsx',{
    react:h.hooks,
    'react-redux':{useSelector:fn=>fn({auth:{location_id:25,role_id:7}})},
    'react-router-dom':{useNavigate:()=>()=>{},useParams:()=>({id:'90'})},
    '@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>{}}),useQuery:()=>({data:{items:[],can_edit:true},isPending:false})},
    '../../hooks/useParentDocumentContext':()=>parent,
    '../../hooks/useTanstackQuery':config=>{configurations.push(config);return {data:[{id:7,name:'Office equipment'}],loadUpdate:async value=>writes.push(value)};},
    '../../actions/common':{tokenHelpers:{getTenantDb:()=> 'test',getToken:()=> 'test'}},
    '../../components/common/ParentDocumentContext':()=>null,
    '../../components/procurement/ItemEvidencePanel':()=>null,
    '../../utils/functions/purchasingApi':{purchasingRequest:async()=>{}},
    './RequisitionItems':()=>null,
    './RequistiontemForm':function OriginalRequisitionForm(){return null;}
  });
  h.render(()=>Page());assert.equal(configurations.some(config=>config.uniqueKey==='demand-accounts'),false);
  parent={isPending:false,document:{id:90,title:'IT demand',location_id:25,requisition_type:1,purchasing_version:2}};
  let tree=h.render(()=>Page());assert.equal(configurations.some(config=>config.uniqueKey==='demand-accounts'),false);
  const add=find(tree,node=>node.type==='button'&&node.props.children==='Add requested item');assert.ok(add);add.props.onClick();
  tree=h.render(()=>Page());const form=find(tree,node=>node.type?.name==='OriginalRequisitionForm');assert.ok(form);
  assert.equal(form.props.priceFree,true);assert.equal(form.props.requisitionId,90);assert.equal(form.props.parent_row.location_id,25);
  assert.equal(form.props.accountOptions,undefined);
  await form.props.onSave({item_id:51,category_id:5,is_type:1,quantity:5,special_instructions:'Keyboard',delivery_required_by:'2026-11-20',unit_price:'0.00',total_price:'0.00'});
  assert.equal(writes.length,1);assert.equal(writes[0].requisition_id,90);assert.equal('account_id' in writes[0],false);assert.equal(writes[0].is_type,1);assert.equal(writes[0].special_instructions,'Keyboard');assert.equal(writes[0].delivery_required_by,'2026-11-20');
  tree=h.render(()=>Page());assert.equal(find(tree,node=>node.type?.name==='OriginalRequisitionForm'),null);
});
test('Purchase Orders open the original requisition picker and carry its outstanding quantity into the editor',()=>{
  const h=harness(),configs=[];
  const Page=load('src/pages/Product/PurchasingItems.jsx',{
    react:h.hooks,'react-redux':{useSelector:fn=>fn({auth:{location_id:25,role_id:7}})},
    'react-router-dom':{useNavigate:()=>()=>{},useParams:()=>({id:'91'})},
    '@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>{}}),useQuery:()=>({data:{items:[],can_edit:true,candidates:[{id:41,requisition_id:80,item_id:100,item_name:'Hardware Equipment',unit:'pieces',account_id:null,source_title:'IT keyboards',available_quantity:5},{id:42,item_id:100,account_id:8,source_title:'Different existing account',available_quantity:1}]},isPending:false})},
    '../../hooks/useParentDocumentContext':()=>({document:{id:91,requisition_type:2,purchasing_version:2}}),
    '../../hooks/useTanstackQuery':config=>{configs.push(config);return {data:config.uniqueKey==='purchasing-catalogue'?[{id:30,children:[{id:100,grp:5,name:'Hardware Equipment',text_1:'pieces'}]}]:[{id:7,name:'Office equipment'}]};},
    '../../actions/common':{tokenHelpers:{getTenantDb:()=> 'test',getToken:()=> 'test'}},
    '../../components/common/ParentDocumentContext':()=>null,'../../components/procurement/ItemEvidencePanel':()=>null,
    '../../utils/functions/purchasingApi':{purchasingRequest:async()=>{}},'./PurchaseOrderRequisitions':()=>null,
    '../../components/procurement/AddRequisitionItemsModal':function ExistingRequisitionPicker(){return null;}
  });
  let tree=h.render(()=>Page({type:2}));
  assert.equal(configs.find(config=>config.uniqueKey==='purchasing-catalogue').queryType,'getRowsWithChildrenStructuredExpense');
  find(tree,n=>n.type==='button'&&n.props.children==='Add Items').props.onClick();tree=h.render(()=>Page({type:2}));
  const picker=find(tree,n=>n.type?.name==='ExistingRequisitionPicker');
  assert.equal(picker.props.isOpen,true);
  const source=picker.props.orderSelection.items.find(item=>item.id===41);
  assert.equal(source.requisition_title,'IT keyboards');assert.equal(source.remaining_quantity,5);
  picker.props.orderSelection.onSelect(source);tree=h.render(()=>Page({type:2}));
  const choose=(value)=>find(tree,n=>n.type==='select'&&find(n,option=>option.type==='option'&&String(option.props.value)===String(value)));
  assert.equal(choose(100).props.value,'100');
  choose(7).props.onChange({target:{value:'7'}});tree=h.render(()=>Page({type:2}));
  const text=JSON.stringify(tree,(_key,value)=>typeof value==='function'?undefined:value);
  assert.match(text,/IT keyboards/);assert.doesNotMatch(text,/Different existing account/);
  assert.equal(find(tree,n=>n.type==='input'&&n.props['aria-label']==='Quantity for REQ-80').props.value,5);
});
