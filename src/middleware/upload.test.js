const { assert } = require('chai');
const multipartTransfer = require('./upload');

describe(
  'test multipartTransfer()',
  it('should set req.feathers.file', () => {
    const file = "Sample file in real case it's a file not string";
    const request = {
      file,
      feathers: {},
    };
    const nextFunction = () => {
      assert.equal(request.feathers.file, file);
    };

    multipartTransfer(request, {}, nextFunction);
  }),
);
