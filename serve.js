const spawn = require('child_process').spawn;
const express = require('express');

const app = express();

app.use('/try', (req, res, next) => {
  req.url = req.url + '.html';
  next('route')
});
app.use(express.static('build'));
app.post('/z3', (req, res) => {
  const p = spawn('z3', ['-T:5', '-smt2', '-in'], {stdio: ['pipe', 'pipe', 'ignore']});
  req.pipe(p.stdin);
  p.stdout.pipe(res);
});
app.get('/z3', (req, res) => {
  res.end("z3 server is running!");
});
app.use((req, res, next) => {
  res.status(404).sendFile("404.html", {root: __dirname + '/build'});
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).sendFile("500.html", {root: __dirname + '/build'});
});
app.listen(3000, 'localhost', () => {
  console.log('esverify-web listening on http://localhost:3000/');
});
