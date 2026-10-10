package expo.modules.journeyactivity

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class StartOptions : Record {
  @Field val entryId: String = ""
  @Field val title: String = ""
  @Field val subtitle: String = ""
  @Field val startedAt: Double = 0.0
  @Field val openUrl: String = ""
  @Field val stopUrl: String = ""
}

class JourneyActivityModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("JourneyActivity")

    Function("start") { options: StartOptions ->
      JourneyService.start(
        context,
        Journey(
          entryId = options.entryId,
          title = options.title,
          subtitle = options.subtitle,
          startedAt = options.startedAt.toLong(),
          openUrl = options.openUrl,
          stopUrl = options.stopUrl,
        ),
      )
    }

    Function("stop") {
      JourneyService.stop(context)
    }

    Function("canDrawOverlays") {
      Settings.canDrawOverlays(context)
    }

    Function("isOverlayEnabled") {
      JourneyService.isOverlayEnabled(context)
    }

    Function("setOverlayEnabled") { enabled: Boolean ->
      JourneyService.setOverlayEnabled(context, enabled)
    }

    Function("requestOverlayPermission") {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}"),
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    OnActivityEntersForeground {
      JourneyService.onAppVisibilityChanged(inForeground = true)
    }

    OnActivityEntersBackground {
      JourneyService.onAppVisibilityChanged(inForeground = false)
    }
  }
}
