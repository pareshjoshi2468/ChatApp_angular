import 'reflect-metadata';
    import 'zone.js/dist/zone-node';
    import { enableProdMode } from '@angular/core'
    import * as express from 'express';
    import { join } from 'path';

    const PORT = 5000;

    enableProdMode();

    const app = express();

    // let template = readFileSync(join(__dirname, '..', 'dist', 'index.html')).toString();

    // app.engine('html', (_, options, callback) => {
    //   const opts = { document: template, url: options.req.url };

    //   renderModuleFactory(AppServerModuleNgFactory, opts)
    //     .then(html => callback(null, html));
    // });

    app.engine('html', require('ejs').renderFile);

    app.set('view engine', '.html');

    app.get('*.*', express.static(join(__dirname, '.', 'dist')));

    app.get('*', (req, res) => {
      res.render('../dist/index.html');
    });

    app.listen(PORT, () => {
      console.log(`listening on http://localhost:${PORT}!`);
    });