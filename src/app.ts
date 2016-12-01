import { verifyAST } from 'esverify/index';
import { parse } from 'esprima';

function error(msg: string) {
  console.error(msg);
  $("#results").html(`<p style="color:red">#{msg}</p>`);
}

function color(status: string) {
  switch (status) {
    case "unverified": return "black";
    case "inprogress": return "gray";
    case "sat": return "green";
    case "unsat": return "red";
    case "failed": return "blue";
    case "notest": return "yellow";
  }
}

function show(desc: string, result) {
  var res = $("<div>");
  $(`<h2>${desc}</h2>`).appendTo(res);
  $(`<p style="color:${color(result.status)}">${result.status}</p>`).appendTo(res);
  $(`<pre>${JSON.stringify(result)}</pre>`).appendTo(res);
  return res.appendTo('#results');
}

function run(js: string) {
  var p = Promise.resolve();
  var vcs = verifyAST(parse(js));
  $("#results").html('');
  vcs.forEach(vc => {
    var r = show(vc.description, vc.result());
    p = p.then(() => vc.solve())
         .then(() => { r.remove(); show(vc.description, vc.result()); });
  });
  p.catch(e => error('Error: ' + e));
}

$(() => {
  const editor = ace.edit('editor');
  editor.getSession().setMode('ace/mode/javascript');
  editor.setTheme('ace/theme/chrome');
  $("#veriBtn").click(() => {
    run(editor.getValue());
  });
});