import { verifyAST } from 'esverify/index';
import VerificationCondition, { Result } from 'esverify/src/vc';
import { parse } from 'esprima';

function error(pane, msg: string) {
  console.error(msg);
  pane.html(`<p style="color:red">${msg}</p>`);
}

function color(status: string) {
  switch (status) {
    case "unverified": return "black";
    case "inprogress": return "gray";
    case "verified": return "green";
    case "incorrect": return "red";
    case "error": return "blue";
    case "tested": return "yellow";
  }
}

function show(out, vc: VerificationCondition) {
  const result = vc.result(),
        desc = vc.description;
  out.html('')
     .append($(`<strong style="color:${color(result.status)}">${desc}</strong>`))
     .append($(`<br />`))
     .append($(`<pre style="margin-top:0;margin-bottom:0">${JSON.stringify(result, null, 2)}</pre>`));
  if (result.status == "incorrect" || result.status == "tested") {
    const btn = $(`<button>Run Test</button>`);
    btn.click(() => vc.runTest());
    out.append(btn);
  }
}

function verify(js: string, pane) {
  var p = Promise.resolve();
  var vcs = verifyAST(parse(js));
  pane.html('');
  if (!vcs) error(pane, "Cannot find VCs");
  vcs.forEach(vc => {
    var r = $("<div>").appendTo(pane);
    show(r, vc);
    p = p.then(() => vc.solve())
         .then(() => { show(r, vc); });
  });
  p.catch(e => error(pane, 'Error: ' + e));
}

(<any>window)["verify"] = verify;