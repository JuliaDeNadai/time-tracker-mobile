const { withEntitlementsPlist } = require('expo/config-plugins');

// Free (personal) Apple teams can't sign the Push Notifications capability that
// expo-notifications adds. The app only uses local notifications, so local builds
// drop it; EAS builds (EAS_BUILD=true) keep it.
module.exports = function withoutLocalPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    if (!process.env.EAS_BUILD) {
      delete cfg.modResults['aps-environment'];
    }
    return cfg;
  });
};
