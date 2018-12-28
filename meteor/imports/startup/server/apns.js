import apnagent from 'apnagent';

let agent = new apnagent.Agent();

agent
  .set('cert', Assets.getText('certprod.pem'))
  .set('key', Assets.getText('keyprod.pem'))//
  //.enable('sandbox')/////
  .connect(function (err) {
    if (err) {
      console.log('agent connect error', err)
      throw err;
    }
  });

export default agent;