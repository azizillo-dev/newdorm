const b = require('bcryptjs');
const { Pool } = require('pg');
b.hash('admin123', 10).then(h => {
  const p = new Pool({host:'localhost',port:5432,database:'tatu_yotoqxona',user:'tatu_admin',password:'TatuSecure2024x'});
  p.query('UPDATE users SET password=$1 WHERE username=$2', [h, 'admin'])
    .then(() => { console.log('OK! Hash:', h); p.end(); })
    .catch(e => { console.log('Xato:', e.message); p.end(); });
});
