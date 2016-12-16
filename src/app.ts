import { verifyAST } from 'esverify/index';
import { parse } from 'esprima';

function error(pane, msg: string) {
  console.error(msg);
  pane.html(`<p style="color:red">${msg}</p>`);
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

function show(res, desc: string, result) {
  res.html('')
     .append($(`<strong style="color:${color(result.status)}">${desc}</strong>`))
     .append($(`<br />`))
     .append($(`<pre style="margin-top:0;margin-bottom:0">${JSON.stringify(result, null, 2)}</pre>`));
  if (result.status != "")
     .append($(`<pre style="margin-top:0;margin-bottom:0">${JSON.stringify(result, null, 2)}</pre>`));
}

function verify(js: string, pane) {
  var p = Promise.resolve();
  var vcs = verifyAST(parse(js));
  pane.html('');
  vcs.forEach(vc => {
    var r = $("<div>").appendTo(pane);
    show(r, vc.description, vc.result());
    p = p.then(() => vc.solve())
         .then(() => { show(r, vc.description, vc.result()); });
  });
  p.catch(e => error(pane, 'Error: ' + e));
}

(<any>window)["verify"] = verify;