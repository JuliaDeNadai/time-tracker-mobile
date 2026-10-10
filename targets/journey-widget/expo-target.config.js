/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'JourneyWidget',
  displayName: 'Jornada',
  deploymentTarget: '16.4',
  frameworks: ['SwiftUI', 'WidgetKit', 'ActivityKit'],
  colors: {
    $accent: '#61B15A',
    $widgetBackground: '#FFFFFF',
  },
};
