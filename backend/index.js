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
    'http://k8s:3000'
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
    _.forEach(data.items, item => {
      item.metadata.image = item.spec?.containers[0].image?.split('/')[1].split(':')[0];
      item.metadata.version = item.spec?.containers[0].image?.split('/')[1].split(':')[1];
    });
    res.json({ result: 'SUCCESS', data });
  });
});

router.post('/deleteDomain', jsonParser, (req, res) => {
  console.log('Delete', req.body.domainName);
  const param = req.body;
  if (_.isNil(param.domainName)) {
    res.json({ result: 'FAIL', reason: 'No param body' });
  }

  exec(`./delete.py ${param.domainName}`);
  console.log(`[Delete] Domain ${param.domainName} success`);
  res.json({ result: 'SUCCESS' });
});

router.post('/addDomain', jsonParser, (req, res) => {
  console.log('Add', req.body?.domainName, req.body?.imageVersion);
  const param = req.body;
  if (_.isNil(param.domainName) || _.isNil(param.imageVersion)) {
    res.json({ result: 'FAIL', reason: 'No param body' });
  }
  exec(`./deployment.py ${param.domainName} ${param.imageVersion}`);
  console.log(`[Add] Domain ${param.domainName} Version ${param.imageVersion} success`);
  res.json({ result: 'SUCCESS' });
});

router.post('/getDomainConnection', jsonParser, (req, res) => {
  console.log('Get connection info', req.body.domainName);
  const param = req.body;
  if (_.isNil(param.domainName)) {
    res.json({ result: 'FAIL', reason: 'No param body' });
  }
  exec(`./get_service.py ${param.domainName}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error}`);
      return;
    }
    const serviceName = stdout;
    res.json({ result: 'SUCCESS', serviceName: serviceName });
  });
})