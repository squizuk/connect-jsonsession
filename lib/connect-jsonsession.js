/*!
 * Connect - JSON Session
 * Copyright(c) 2011 James Hurst <jhurst@squiz.co.uk>
 */


/**
 * Module dependencies.
 */
var uuid = require('node-uuid');
var url = require('url');


module.exports = function() {
    return function(req, res, next) {
	// Initialise session bucket
	if (req.session == undefined) {
	    next(Error("No session available"));
	} else {
	    if (req.session.__data === undefined) {
		console.log("Initialising session bucket");
		req.session.__data = {};
	    }
	}
	
	// Turn an empty request body into an empty object
	if (req.body === undefined) {
	    req.body = {}
	}

	// Trim leading and trailing slashes
	var path = url.parse(req.url).pathname.replace(/^\//,'')
	path = path.replace(/\/$/,'');
	
	if (path.length > 0) {
	    var components = path.split('/');
	} else {
	    var components = [];
	}

	// Manipulate the given branch based on the request method
	function manipulate(branch, leaf) {
	    switch (req.method) {
	    case 'PUT':
		branch[leaf] = req.body;
		break;
	    case 'POST':
		if (req.query.index) {
		    if (req.query.index == 'uuid') {
			// Generate a new uuid placeholder, and return it.
			var index = uuid();
			branch[leaf][index] = req.body;
			return { "index": index };
		    } else if (req.query.index == 'seq') {
			if (branch[leaf].constructor != Array) {
			    // Nuke what's there to create an array
			    branch[leaf] = Array();
			}

			branch[leaf].push(req.body);
			return { "index": branch[leaf].length - 1 };
		    }
		} else {
		    for (var key in req.body) {
			branch[leaf][key] = req.body[key];
		    }
		}	
		break;
	    case 'DELETE':
		delete branch[leaf];
		return {};
	    }
	    return branch[leaf];
	}

	if (components.length === 0) {
	    // We're working at the root
	    res.body = manipulate(req.session, '__data');
	} else {
	    var d = req.session.__data;
	    // Loop down the path..
	    for (var i in components) {
		var c = components[i];

		// If we hit a dead end, see if we can PUT
		if ((d[c] === undefined) || (d[c] === null)) {
		    if (req.method == 'PUT') {
			d[c] = new Object;
		    } else {
			res.statusCode = 404;
			res.body = {};
			break;
		    }
		}

		// If we're at the end of thepath, we can do stuff
		if (i == components.length - 1) {
		    res.body = manipulate(d, c);
		    break;
		} else {
		    // Walk on
		    d = d[c];
		}
	    }
	}

	res.header('Content-Type', 'application/json');
	res.end(JSON.stringify(res.body));
    }
};
