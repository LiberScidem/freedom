/**
 * Implementation of a Social provider with a fake buddylist
 * 'Other User' echos everything you send to it back to you
 * This is particularly useful when you're debugging UIs with multi-user interactions
 *
 * The provider offers
 * - a buddylist of fake users
 * - no reliability of message delivery
 * - in-order delivery
 * - clients are statically defined in the class
 * - 'Other User' is a special buddy that echos what you say back to you
 **/

var social = freedom.social();
var STATUS_NETWORK = social.STATUS_NETWORK;
var STATUS_CLIENT = social.STATUS_CLIENT;
var NETWORK_ID = 'loopback';
var USER_ID = 'Test User';
var CLIENT_ID = 'Test User.0';

function SocialProvider() {
  console.log("Loopback Social provider");
  this.roster = {
    USER_ID: {
      userId: USER_ID,
      name: USER_ID,
      clients: {'Test User.0': {
        'clientId': CLIENT_ID,
        'network': NETWORK_ID,
        'status': STATUS_CLIENT["MESSAGEABLE"]
      }}
    },
    "Other User": {
      userId: "Other User",
      name: "Other User",
      clients: {'Other User.0':{
        'clientId': "Other User.0", 
        'network': NETWORK_ID,
        'status': STATUS_CLIENT["MESSAGEABLE"]
      }}
    },
    'Johnny Appleseed': makeRosterEntry('Johnny Appleseed'),
    'Betty Boop': makeRosterEntry('Betty Boop'),
    'Big Bird': makeRosterEntry('Big Bird'),
    'Bugs Bunny': makeRosterEntry('Bugs Bunny'),
    'Daffy Duck': makeRosterEntry('Daffy Duck'),
    'Kermit the Frog': makeRosterEntry('Kermit the Frog'),
    'Minnie Mouse': makeRosterEntry('Minnie Mouse'),
    'Porky Pig': makeRosterEntry('Porky Pig'),
    'Swedish Chef': makeRosterEntry('Swedish Chef'),
    'Yosemite Sam': makeRosterEntry('Yosemite Sam')
  };
  setTimeout((function() {
    this.dispatchEvent('onStatus', {
      network: NETWORK_ID,
      userId: USER_ID,
      status: STATUS_NETWORK['OFFLINE'],
      message: "Woo!"
    });
  }).bind(this), 0);
}

var STATUSES = ['MESSAGEABLE', 'ONLINE', 'OFFLINE'];

function makeRosterEntry(userId, opts) {
  opts = opts || {};
  var entry = {
    userId: userId,
    name: opts.name || userId,
  };
  if (opts.clients) {
    entry.clients = opts.clients;
  } else {
    var clients = {};
    var nclients = userId.charCodeAt(0) % 3;
    for (var i=0; i<nclients; ++i) {
      var clientId = userId+'/-client'+i;
      clients[clientId] = {
        clientId: clientId,
        network: NETWORK_ID,
        status: STATUS_CLIENT[STATUSES[i]]
      };
    }
    entry.clients = clients;
  }
  return entry;
}

SocialProvider.prototype.login = function(opts, continuation) {
  var ret = {
    network: NETWORK_ID,
    userId: USER_ID,
    status: STATUS_NETWORK["ONLINE"],
    message: "Woo!"
  };
  for (var id in this.roster) {
    if (this.roster.hasOwnProperty(id)) {
      this.dispatchEvent('onChange', this.roster[id]);
    }
  }
  this.dispatchEvent('onStatus', ret);
  continuation(ret);
};

SocialProvider.prototype.getRoster = function(continuation) {
  continuation(this.roster);
};

// Send a message to someone.
SocialProvider.prototype.sendMessage = function(to, msg, continuation) {
  this.dispatchEvent('onMessage', {
    fromUserId: "Other User",
    fromClientId: "Other User.0",
    toUserId: USER_ID,
    toClientId: CLIENT_ID,
    network: NETWORK_ID,
    message: msg
  });
  continuation();
};

SocialProvider.prototype.logout = function(opts, continuation) {
  var ret = {
    network: NETWORK_ID,
    userId: USER_ID,
    status: STATUS_NETWORK['OFFLINE'],
    message: 'Woo!'
  };
  // Remove all clients in the roster and emit these changes
  for (var id in this.roster) {
    if (this.roster.hasOwnProperty(id)) {
      var card = JSON.parse(JSON.stringify(this.roster[id]));
      card.clients = {};
      this.dispatchEvent('onChange', card);
    }
  }
  this.dispatchEvent('onStatus', ret);
  continuation(ret);
};

social.provideAsynchronous(SocialProvider);
