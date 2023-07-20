const getPackage = require('./get-package');

getPackage('micromatch')
  .then(data => console.log(data))
  .catch(err => console.error(err));
