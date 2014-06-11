var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');

module.exports = {
    root: rootPath,
    port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL,
    mailer: {
      auth: {
        user: 'tropicalmeds2014@gmail.com',
        pass: 'Tropical@meds'

      },
      defaultFromAddress: 'noreply@tropicalmeds.com'
    }
}
