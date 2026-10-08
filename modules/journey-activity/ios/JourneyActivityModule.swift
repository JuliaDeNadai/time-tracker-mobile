import ActivityKit
import ExpoModulesCore

struct StartOptions: Record {
  @Field var entryId: String = ""
  @Field var title: String = ""
  @Field var subtitle: String = ""
  @Field var startedAt: Double = 0
  @Field var openUrl: String = ""
  @Field var stopUrl: String = ""
}

public class JourneyActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("JourneyActivity")

    AsyncFunction("start") { (options: StartOptions) async throws in
      guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

      let running = Activity<JourneyAttributes>.activities.contains {
        $0.attributes.entryId == options.entryId && $0.activityState == .active
      }
      if running { return }

      await Self.endAll()

      let attributes = JourneyAttributes(
        entryId: options.entryId,
        title: options.title,
        subtitle: options.subtitle,
        startedAt: Date(timeIntervalSince1970: options.startedAt / 1000),
        openUrl: options.openUrl,
        stopUrl: options.stopUrl
      )
      let content = ActivityContent(state: JourneyAttributes.ContentState(), staleDate: nil)
      _ = try Activity.request(attributes: attributes, content: content, pushType: nil)
    }

    AsyncFunction("stop") { () async in
      await Self.endAll()
    }

    Function("canDrawOverlays") { false }

    Function("isOverlayEnabled") { false }

    Function("setOverlayEnabled") { (_: Bool) in }

    Function("requestOverlayPermission") {}
  }

  private static func endAll() async {
    for activity in Activity<JourneyAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }
}
