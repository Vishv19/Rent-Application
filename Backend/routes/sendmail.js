var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport('smtps://rentz.application%40gmail.com:ZXC1234567890@smtp.gmail.com');

module.exports.sendmail = function(message, callback) {
  transport.sendMail(message, function(err, res) {
    if(err) callback(err);
    transport.close();
    callback(null, res);
  });
}