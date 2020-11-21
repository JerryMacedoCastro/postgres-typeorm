import * as express from 'express'

const app = express();

app.get('/', (request, response) => {
  response.send('Heelo darkness my old friend!');
});

app.listen(5000);