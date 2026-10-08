import ActivityKit
import SwiftUI
import WidgetKit

private let green = Color(red: 0x8E / 255, green: 0xDF / 255, blue: 0x81 / 255)
private let greenDark = Color(red: 0x61 / 255, green: 0xB1 / 255, blue: 0x5A / 255)
private let danger = Color(red: 0xFE / 255, green: 0x69 / 255, blue: 0x7D / 255)
private let textDark = Color(red: 0x42 / 255, green: 0x48 / 255, blue: 0x4A / 255)
private let textSoft = Color(red: 0x69 / 255, green: 0x69 / 255, blue: 0x69 / 255)

struct JourneyLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: JourneyAttributes.self) { context in
      LockScreenView(attributes: context.attributes)
        .activityBackgroundTint(.white)
        .activitySystemActionForegroundColor(textDark)
        .widgetURL(URL(string: context.attributes.openUrl))
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Image(systemName: "timer")
            .font(.title2)
            .foregroundColor(green)
            .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          ElapsedText(startedAt: context.attributes.startedAt)
            .font(.title2.monospacedDigit().weight(.semibold))
            .foregroundColor(.white)
            .frame(maxWidth: 110, alignment: .trailing)
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 2) {
              Text(context.attributes.title)
                .font(.headline)
                .foregroundColor(.white)
                .lineLimit(1)
              Text(context.attributes.subtitle)
                .font(.subheadline)
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(1)
            }
            Spacer()
            StopLink(url: context.attributes.stopUrl)
          }
          .padding(.top, 4)
        }
      } compactLeading: {
        Image(systemName: "timer")
          .foregroundColor(green)
      } compactTrailing: {
        ElapsedText(startedAt: context.attributes.startedAt)
          .font(.caption.monospacedDigit().weight(.semibold))
          .foregroundColor(green)
          .frame(maxWidth: 56)
      } minimal: {
        Image(systemName: "timer")
          .foregroundColor(green)
      }
      .widgetURL(URL(string: context.attributes.openUrl))
    }
  }
}

private struct LockScreenView: View {
  let attributes: JourneyAttributes

  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      Image(systemName: "timer")
        .font(.title)
        .foregroundColor(greenDark)

      VStack(alignment: .leading, spacing: 2) {
        Text("Jornada em andamento")
          .font(.caption)
          .foregroundColor(textSoft)
        Text(attributes.title)
          .font(.headline)
          .foregroundColor(textDark)
          .lineLimit(1)
        Text(attributes.subtitle)
          .font(.subheadline)
          .foregroundColor(textSoft)
          .lineLimit(1)
      }

      Spacer(minLength: 8)

      VStack(alignment: .trailing, spacing: 8) {
        ElapsedText(startedAt: attributes.startedAt)
          .font(.title2.monospacedDigit().weight(.semibold))
          .foregroundColor(textDark)
          .frame(maxWidth: 110, alignment: .trailing)
        StopLink(url: attributes.stopUrl)
      }
    }
    .padding(16)
  }
}

/// Conta a partir de `startedAt` sem precisar de atualizações do app.
private struct ElapsedText: View {
  let startedAt: Date

  var body: some View {
    Text(startedAt, style: .timer)
      .multilineTextAlignment(.trailing)
  }
}

private struct StopLink: View {
  let url: String

  var body: some View {
    if let destination = URL(string: url) {
      Link(destination: destination) {
        Text("Encerrar")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.white)
          .padding(.horizontal, 14)
          .padding(.vertical, 6)
          .background(danger)
          .clipShape(Capsule())
      }
    }
  }
}
