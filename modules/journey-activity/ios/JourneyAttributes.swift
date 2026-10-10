import ActivityKit
import Foundation

// Precisa ser idêntica a targets/journey-widget/JourneyAttributes.swift:
// o ActivityKit associa a Live Activity ao widget pelo nome e formato do tipo.
struct JourneyAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {}

  var entryId: String
  var title: String
  var subtitle: String
  var startedAt: Date
  var openUrl: String
  var stopUrl: String
}
