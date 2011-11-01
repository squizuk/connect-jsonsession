# connect-jsonsession

A RESTful API for storing / manipulating JSON structures against a browser session, implemented as Node.js Connect middleware.

Useful for building client side applications which require a session state mechanism.

**Author:** James Hurst <jhurst@squiz.co.uk>

## Dependencies

**connect-session** or **connect-redis**, and **node-uuid**

## Status

First pass, subject to change but it's working.


## Install

Clone the repo into node_modules

	var jsonsession = require('connect-jsonsession');

Then using Express routes, for example..

	app.all('/*', jsonsession(), function(req, res) { 
	    console.log(res.body);
	});


## Usage

Can't GET what's not there.

	GET /foo
	404 {}


PUT anything anywhere.

	PUT /foo {"foo":"bar"}
	200 {"foo":"bar"}
	
	GET /
	200 {
	        "foo": {
	            "foo":"bar"
	        }
	    }


POST to something that exists to merge.

	POST /foo {"foo2":"bar"}
	200 {"foo2":"bar"}

	GET /
	200 {
	        "foo": {
	            "foo":"bar",
	            "foo2":"bar"
	        }
	    }


POST to something that exists and ask for an property UID to create a new child object.

	POST /foo?index=uuid {"foo":"bar"}
	200 {"index": "99aadfad-f620-4ec2-87e6-022297abad80"}

	GET /
	200 {
	        "foo": {
	            "foo":"bar",
	            "foo2":"bar",
	            "99aadfad-f620-4ec2-87e6-022297abad80": {
					"foo":"bar"
				}
	        }
	    }
    
    

POST with a sequence will append to an array.

	PUT /array
	200 {}
	
	POST /array?index=seq {"foo":"bar"}
	200 {
	        "index": 0
	    }
	POST /array {"foo":"bar"}
	200 {
	        "index": 1
	    }
		
	GET /
	200 {
	        "foo": {
	            "foo": "bar",
	            "foo2": "bar",
	            "99aadfad-f620-4ec2-87e6-022297abad80": {
	                "foo": "bar"
	            }
	        },
	        "array": [
	            {
	                "foo": "bar"
	            },
	            {
	                "foo": "bar"
	            }
	        ]
	    }

GET stuff by index.

	GET /array/1
	200 {
	        "foo":"bar"
	    }


Don't like it? DELETE it.

	DELETE /foo/99aadfad-f620-4ec2-87e6-022297abad80
	200 {}
	
	GET /foo
	200 {
	        "foo":"bar",
	        "foo2":"bar"
	    }










