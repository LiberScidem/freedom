fdom.apis.set('identity', {
  'errors': {type: 'constant', value: {
    'SUCCESS': 0,
    'ERR_UNKNOWN': 1,
    'ERR_AUTH': 2,
    'ERR_MISSING_SERVER': 3
  }},
  //e.g. var id = identity.id
  'id': {type: 'property', value: 'string'},
  //Log into the network (See below for parameters)
  //e.g. login(Object options)
  //Returns same schema as onStatus
  'login': {type: 'method', value: [{
    'network': 'string',  //Network name
    'agent': 'string',    //Agent name of app
    'version': 'string',  //Version of app
    'url': 'string',      //URL of app
    'interactive': 'bool' //Prompt user?
  }]},
  //Gets the profile of a user
  //If id is null, return self
  //e.g. identity.getProfile(String id);
  //Returns {
  //  'me': {
  //    'userMe1': {                //Must internal 'userId'
  //      'userId': 'string',        //ID (e.g. alice@gmail.com) username
  //      'name': 'string',         //Name (e.g. Alice Underpants)
  //      'url': 'string',          //Homepage URL
  //      'clients': {
  //        'client1': {              //Array of clients (NOTE: key must match 'clientId' in card)
  //          'clientId': 'string',   //ID of client (e.g. alice@gmail.com/Android-23nadsv32f)
  //          'network': 'string',    //Name of network
  //          'status': 'string'      //Status (['messageable', 'online', 'offline'])
  //        },
  //        'client2': ...
  //      }
  //    },
  //    'userMe2': ...
  //  },
  //  'roster': {                 //List of friends
  //    'user1': {                //NOTE: Key must match 'userId' in user card
  //      'userId': 'string',
  //      'name': 'string',
  //      'url': string,
  //      'clients': {
  //        'client1': {          //NOTE: Key must match 'clientId' in client card
  //          'clientId': 'string',
  //          'network': 'string'
  //          'status': 'string'
  //        },
  //        'client2': ...
  //      }
  //    },
  //    'user2': ...
  //  }
  //}
  'getProfile': {type: 'method', value: ['string']},
  //Send a message to user on your network
  //e.g. sendMessage(String destination_id, String message)
  //Returns nothing
  'sendMessage': {type: 'method', value: ['string', 'string']},
  //Logs out of the userId on the specific network
  //If userId is null, but network is not - log out of all accounts on that network
  //If networkName is null, but userId is not - log out of that account
  //If both fields are null, log out of all accounts on all networks
  //e.g. logout(String userId, String networkName)
  //Returns same schema as onStatus
  'logout': {type: 'method', value: ['string', 'string']},
  //Event on change in profile
  //(includes changes to roster)
  //You will receive an onChange event with your own id; this will tell you
  //your name, url, and imageData.
  //Current contract is that clients grows monotonically, when clients go
  //offline, they are kept in the clients and have |status| "offline".
  'onChange': {type: 'event', value: {
    'userId': 'string',
    'name': 'string',
    'url': 'string',
    'imageData': 'string',
    'clients': 'object'
  }},
  //Event on incoming message
  'onMessage': {type: 'event', value: {
    'fromUserId': 'string',   //userId of user message is from
    'fromClientId': 'string', //clientId of user message is from
    'toUserId': 'string',     //userId of user message is to
    'toClientId': 'string',   //clientId of user message is to
    'network': 'string',      // the network id the message came from.
    'message': 'string'       //message contents
  }},
  //Event on provider status
  //Can be 'offline', 'online', 'authenticating', 'connecting' or 'error'
  //userId is only there when status = online | connecting.
  //All other parameters are always there.
  //
  //TODO: consider userId for when offline happens. What if you're connected
  //to the same network with multiple userIds. Then you need to know which are
  //online and which are not!
  'onStatus': {type: 'event', value: {
    'userId': 'string', //userId of network this is about
    'network': 'string',//name of the network (chosen by identity provider)
    'status': 'string', //One of the above statuses
    'message': 'string' //More detailed message about status
  }}
});

