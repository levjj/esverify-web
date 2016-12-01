const spawn = require('child_process').spawn;
const express = require('express');

const app = express();

app.use(express.static('build'));
app.use(express.static('static'));
app.post('/z3', (req, res) => {
  const p = spawn('/home/cs/Projects/jsfxs/z3/build/z3', ['-smt2', '-in'], {stdio: ['pipe', 'pipe', 'ignore']});
  req.pipe(p.stdin);
  p.stdout.pipe(res);
});
app.get('/z3', (req, res) => {
  res.end("Z3Server is running!");
});
app.listen(3000, function () {
  console.log('esverify-browser listening on http://localhost:3000/');
})
