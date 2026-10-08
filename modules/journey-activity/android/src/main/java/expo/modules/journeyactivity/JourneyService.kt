package expo.modules.journeyactivity

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

/**
 * Mantém a notificação com cronômetro enquanto a jornada estiver ativa e
 * controla a bolha flutuante, exibida só quando o app está em segundo plano.
 */
class JourneyService : Service() {
  companion object {
    private const val CHANNEL_ID = "journey_tracking"
    private const val NOTIFICATION_ID = 4210
    private const val PREFS = "journey_activity"
    private const val KEY_OVERLAY_ENABLED = "overlay_enabled"

    private var instance: JourneyService? = null
    private var appInForeground = true

    fun isOverlayEnabled(context: Context) =
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getBoolean(KEY_OVERLAY_ENABLED, true)

    fun setOverlayEnabled(context: Context, enabled: Boolean) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
        .putBoolean(KEY_OVERLAY_ENABLED, enabled)
        .apply()
      instance?.refreshBubble()
    }

    fun start(context: Context, journey: Journey) {
      val intent = Intent(context, JourneyService::class.java).putExtras(journey.toBundle())
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, JourneyService::class.java))
    }

    fun onAppVisibilityChanged(inForeground: Boolean) {
      appInForeground = inForeground
      instance?.let {
        if (inForeground) it.bubbleHiddenByUser = false
        it.refreshBubble()
      }
    }
  }

  private var journey: Journey? = null
  private var bubble: JourneyBubble? = null
  private var bubbleHiddenByUser = false

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    instance = this
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val newJourney = intent?.extras?.let(Journey::fromBundle)
    if (newJourney == null) {
      stopSelf()
      return START_NOT_STICKY
    }

    createChannel()
    val notification = buildNotification(newJourney)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }

    if (newJourney != journey) {
      bubble?.remove()
      bubble = null
    }
    journey = newJourney
    refreshBubble()
    return START_REDELIVER_INTENT
  }

  override fun onDestroy() {
    bubble?.remove()
    bubble = null
    instance = null
    super.onDestroy()
  }

  private fun refreshBubble() {
    val current = journey ?: return
    val shouldShow = !appInForeground &&
      !bubbleHiddenByUser &&
      isOverlayEnabled(this) &&
      Settings.canDrawOverlays(this)

    if (shouldShow && bubble == null) {
      bubble = JourneyBubble(
        context = this,
        journey = current,
        onOpen = { openUrl(current.openUrl) },
        onStop = { openUrl(current.stopUrl) },
        onHide = {
          bubbleHiddenByUser = true
          refreshBubble()
        },
      ).also { it.show() }
    } else if (!shouldShow) {
      bubble?.remove()
      bubble = null
    }
  }

  private fun deepLinkIntent(url: String) =
    Intent(Intent.ACTION_VIEW, Uri.parse(url))
      .setPackage(packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)

  /** Apps com permissão de sobreposição podem abrir activities a partir de segundo plano. */
  private fun openUrl(url: String) {
    startActivity(deepLinkIntent(url))
  }

  private fun pendingDeepLink(url: String, requestCode: Int): PendingIntent =
    PendingIntent.getActivity(
      this,
      requestCode,
      deepLinkIntent(url),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(CHANNEL_ID, "Jornada em andamento", NotificationManager.IMPORTANCE_LOW).apply {
      setShowBadge(false)
      setSound(null, null)
      enableVibration(false)
    }
    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }

  private fun buildNotification(journey: Journey): Notification =
    NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.journey_activity_ic_timer)
      .setColor(0xFF61B15A.toInt())
      .setContentTitle(journey.title)
      .setContentText(journey.subtitle)
      .setWhen(journey.startedAt)
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
      .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
      .setContentIntent(pendingDeepLink(journey.openUrl, 0))
      .addAction(0, "Encerrar", pendingDeepLink(journey.stopUrl, 1))
      .build()
}
