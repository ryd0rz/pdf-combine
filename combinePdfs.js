var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var tmpdir = require('os').tmpdir;
var usePdfUnite = require('./lib/usePdfUnite');

function run (cmd, args, output, inputControl, debug, callback) {
  if (debug) {
    console.log('[debug] Calling:', cmd, args.map(function (arg) {
      return '"' + arg.replace(/"/g, '\\"').replace(/\n/gm, '\\n') + '"';
    }).join(' '));
  }
  console.log('here1');
  var process = spawn(cmd, args);
  console.log('here2');
  var error = '';
  console.log('here3');
  process.stderr.on('data', function (data) {
    console.log('stderr hit');
    error += data;
  });
  console.log('here4');
  process.on('exit', function (code) {
    console.log('exit hit');
    if (code === 0) {
      console.log('asdf1');
      fs.readFile(output, function (err, buffer) {
        console.log('inside readFile callback');
        inputControl.forEach(function (input) {
          console.log('clean up time');
          console.log(input.cleanup);
          input.cleanup();
          console.log('did we clean up?');
        });
        console.log('asdf4');
        fs.unlink(output, function() { return null; });
        console.log('asdf5');
        callback(err, buffer);
      });
      console.log('asdf2');
    } else {
      console.log('asdf10');
      callback(new Error(error));
    }
  });
  console.log('here5');
}

function combinePdfs (buffers, debug, callback) {
  if (typeof debug === 'function') {
    callback = debug;
    debug = false;
  }
  buffers = buffers.map(function makeSureOfBuffer (input, nr) {
    if (input instanceof Buffer) {
      return input;
    } else if (input.encoding !== undefined) {
      if (debug) {
        console.log('[debug] Converting ' + nr + ' to buffer with encoding ' + input.encoding);
      }
      return new Buffer(input.text, input.encoding);
    } else if (input.file) {
      if (debug) {
        console.log('[debug] Converting ' + nr + ' to buffer from file ' + input.file);
      }
      return fs.readFileSync(input.file);
    }
    if (debug) {
      console.log('[debug] Converting ' + nr + ' to buffer from string');
    }
    return new Buffer(input.toString());
  })
  if (buffers.length === 0) {
    return setImmediate(callback.bind(null, null, undefined));
  }
  var inputControl = buffers.map(bufferToTmp);
  var input = inputControl.map(function (tmp) {
    return tmp.path;
  });
  usePdfUnite(debug, function (err, pdfUnite) {
    if (err) {
      console.log(err);
      return;
    }
    var output = tmpFileName();
    if (pdfUnite) {
      console.log('inputControl: ');
      console.log(inputControl);
      return run(pdfUnite, input.concat([output]), output, inputControl, debug, callback);
    } else {
      console.log('please install poppler to use combine-pdfs');
    }
  });
}

function tmpFileName () {
  return path.resolve(tmpdir(),
    'pdf-combine-' +
    tmpFileName.processId +
    '-' +
    (tmpFileName.cnt++).toString(10) +
    '.pdf'
  );
}
tmpFileName.processId = Date.now().toString(16) + '-' + (Math.random() * 10000).toString(16);
tmpFileName.cnt = 1;

function bufferToTmp (buffer) {
  var tmpPath = tmpFileName();
  fs.writeFileSync(tmpPath, buffer);
  return {
    path: tmpPath,
    cleanup: fs.unlink.bind(fs, tmpPath, function () {
      return null;
    })
  };
}

module.exports = combinePdfs;
