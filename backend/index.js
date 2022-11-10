const express = require('express');
const cors = require('cors');
const bodyParse = require('body-parser');
const _ = require('lodash');
const { fork, exec } = require('child_process');

const app = express();
const port = 3001;
const router = express.Router();
const jsonParser = bodyParse.json();

const corsOptions = {
  origin: [
    'http://localhost:3000'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(router);
app.listen(port);

app.get('/', (req, res) => {
  res.send('Hello World! XD');
});

router.get('/getDomainList', (req, res) => {
  exec('./list_pod.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error}`);
      return;
    }
    const data = JSON.parse(stdout);
    res.json({ result: 'SUCCESS', data });
  })
});

router.post('/deleteDomain', jsonParser, (req, res) => {
  console.log('Delete', req.body.domainName);
  const param = req.body;
  if (_.isNil(param.domainName)) {
    res.json({ result: 'FAIL', reason: 'No param body' });
  }
  const deleteDomainShell = fork("delete.py", [param.domainName]);
  deleteDomainShell.on('close', (code) => {
    console.log(`[Delete] Domain ${param.domainName} success`);
    res.json({ result: 'SUCCESS' });
  });
});

router.post('/addDomain', jsonParser, (req, res) => {
  console.log('Add', req.body.domainName);
  const param = req.body;
  if (_.isNil(param.domainName)) {
    res.json({ result: 'FAIL', reason: 'No param body' });
  }
  const addDomainShell = fork("deployment.py", [param.domainName]);
  addDomainShell.on('close', (code) => {
    console.log(`[Deployment] Domain ${param.domainName} success`);
    res.json({ result: 'SUCCESS' });
  });
});