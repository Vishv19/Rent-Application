var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

module.exports.sendmail = function(message, callback) {
  transport.sendMail(message, function(err, res) {
    if(err) callback(err);
    transport.close();
    callback(null, res);
  });
}