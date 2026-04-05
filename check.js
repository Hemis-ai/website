const fs = require('fs'); const html = fs.readFileSync('index.html', 'utf8'); console.log('Match count is:', (html.match(/class="how-cinema__dots"/g) || []).length);
