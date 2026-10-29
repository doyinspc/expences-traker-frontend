const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.env.PROKURE_ROOT||path.resolve(__dirname,'..');
const React=require(path.join(root,'node_modules/react'));
const {renderToStaticMarkup}=require(path.join(root,'node_modules/react-dom/server'));
const {transformSync}=require(path.join(root,'node_modules/esbuild'));
function render(result){
 let state=0;const values=[null,false,'',result];
 const mocks={react:{...React,useState:()=>[values[state++],()=>{}]},axios:{},'../../actions/common':{API_PATH_SETTING:'/blocked-fixture',axiosConfig:{},axiosConfig1:{}}};
 const module={exports:{}};const code=transformSync(fs.readFileSync(path.join(root,'src/pages/Teams/EmailDeliveryStatus.jsx'),'utf8'),{format:'cjs',loader:'jsx',jsx:'automatic'}).code;
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>id in mocks?mocks[id]:require(require.resolve(id,{paths:[root]}))});
 return renderToStaticMarkup(React.createElement(module.exports.default));
}
test('Mail rejection uses the safe backend explanation despite request success',()=>{const html=render({success:true,accepted_by_mail_server:false,failure_code:'smtp_authentication_failed',failure_message:'The outgoing mail server rejected the login.'});assert.match(html,/rejected the login/);assert.doesNotMatch(html,/Test accepted by the mail server for/);});
test('An older server response still has a readable SMTP failure fallback',()=>{assert.match(render({accepted_by_mail_server:false,failure_code:'smtp_connection_authentication_or_delivery_failed'}),/SMTP connection, authentication or delivery failed/);});
test('Backend explanations are rendered as text instead of executable markup',()=>{const html=render({accepted_by_mail_server:false,failure_message:'<script>alert(1)</script>'});assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);});
test('Only actual mail acceptance displays successful submission feedback',()=>{const html=render({accepted_by_mail_server:true,recipient:'fixture@example.invalid'});assert.match(html,/Test accepted by the mail server for fixture@example.invalid/);assert.match(html,/does not confirm inbox delivery/);});
