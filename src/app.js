import { verify } from 'esverify';
import $ from 'jquery';
import ace from 'brace';
import 'brace/theme/chrome';
import 'brace/mode/javascript';

import { examples } from './examples.js';

function init() {
  const editor = ace.edit('editor');
  editor.getSession().setMode('ace/mode/javascript');
  editor.setTheme('ace/theme/chrome');
  editor.setShowPrintMargin(false);
  editor.setOptions({ fontFamily: "Inconsolata", fontSize: "12pt" });

  function msgType(msg) {
    switch (msg.status) {
      case "verified": return "info";
      case "unverified": return "warning";
      case "inprogress": return "warning";
    }
    return "error";
  }

  function msgText(msg) {
    switch (msg.status) {
      case "verified":
        return `verified: ${msg.description}`;
      case "unverified":
      case "unknown":
        return `${msg.status}: ${msg.description}`;
    }
    return `error: ${msg.type} ${msg.description}`;
  }

  function msgAsAnnotation(msg) {
    return {
      row: Math.max(0, msg.loc.start.line - 1),
      column: msg.loc.start.column,
      text: msgText(msg),
      type: msgType(msg)
    };
  }

  function verifyCode() {
    $("#veriBtn").addClass('loading');
    const opts = { remote: true, z3url: '/z3' };
    verify(editor.getValue(), opts).then(showMessages);
  }

  function loadExample(name) {
    editor.setValue(examples[name], -1);
    setTimeout(() => verifyCode(), 300);
  }

  function showMessages(msgs) {
    editor.getSession().setAnnotations(msgs.map(msgAsAnnotation));
    $("#veriBtn").removeClass('loading');
  }

  $("#veriBtn").click(verifyCode);

  if (window.location.hash && window.location.hash != "#" && window.location.hash != "#max") {
    loadExample(window.location.hash.substr(1));
  }

  $.each($("#examples a"), (i, e) => {
    e.onclick = (evt) => loadExample(e.href.split('#')[1]);
  });
}

$(() => init());
