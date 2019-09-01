const Realm = require('realm');

const People = {
  name: 'People',
  primaryKey: 'id',
  properties: {
    id: 'int', // primary key
    firstName: 'string',
    lastName: 'string',
    documentID: 'string',
    phoneNumber: 'string',
    email: 'string',
    isSynchronized: {type: 'bool', default: false},
    createAt: 'date',
  },
};

// return realm
export default Realm.open({schema: [People]});
