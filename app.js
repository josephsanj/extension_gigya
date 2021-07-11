const express = require('express');
const cache = require('memory-cache');
const jws = require('jws');
const jws_jwk = require('jws-jwk');
const Gigya = require('gigya').Gigya
// Initialize SDK with your API Key , data center, user key and Secret.
const gigya = new Gigya('<API_Key>', '<data_center>', '<user_key>' , '<Secret_key>');
const app = express();
const router = express.Router();

// import body-parser
app.use(express.json());         // to support JSON-encoded bodies
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

// dummy GET service
app.get('/register', (req, res, next) => {
    res.json(["Array1","Array2","Array3"]);
});

// POST Service
app.post('/register', async (req, res) => {
    var token = req.body.jws;
//	var payload = utils.getPayloadDecoded(jws);
    var decoded = jws.decode(token);
	var jwk = cache.get('jwk');
	var body = JSON.parse(decoded.payload);
	var ret = { status: 'OK' };


	if(!jwk || decoded.header.keyid !== jwk.kid) {
		jwk = await gigya.accounts.getJWTPublicKey();
		cache.put('jwk' , jwk);
	}
	//verify token
	if (!jws_jwk.verify(token, jwk)) {
		return res.status(200).json({
			'status': 'FAIL',
			'data': {
				'userFacingErrorMessage': 'Could not validate your request'
			}
		});
	}


// logic handling
   if (body.extensionPoint === 'OnBeforeAccountsRegister'){
	    if (!body.data.params.email.endsWith('@xyz.com')){
	{
		ret.status  = 'FAIL';
		var customMessage =  'Email should belong to domain "xyz.com"';
		ret.data = {
			validationErrors: [
			{ fieldName: 'email', 
			  message: customMessage 
			},
		]
	}
	}
		}
   }

	 res.setHeader('Content-Type', 'application/json');
     res.send(JSON.stringify(ret));
 //   res.send(decoded);
//	return res.status(200).json(ret);

});

// Global error handler - route handlers/middlewares which throw end up here
app.use((err, req, res, next) => {
    res.status(err.status || 500);
     res.end();
});

//export app
module.exports = app;
