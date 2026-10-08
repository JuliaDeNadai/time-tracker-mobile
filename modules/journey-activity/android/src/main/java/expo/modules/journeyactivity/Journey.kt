package expo.modules.journeyactivity

import android.os.Bundle

data class Journey(
  val entryId: String,
  val title: String,
  val subtitle: String,
  /** Epoch em milissegundos. */
  val startedAt: Long,
  val openUrl: String,
  val stopUrl: String,
) {
  fun toBundle() = Bundle().apply {
    putString(KEY_ENTRY_ID, entryId)
    putString(KEY_TITLE, title)
    putString(KEY_SUBTITLE, subtitle)
    putLong(KEY_STARTED_AT, startedAt)
    putString(KEY_OPEN_URL, openUrl)
    putString(KEY_STOP_URL, stopUrl)
  }

  companion object {
    private const val KEY_ENTRY_ID = "entryId"
    private const val KEY_TITLE = "title"
    private const val KEY_SUBTITLE = "subtitle"
    private const val KEY_STARTED_AT = "startedAt"
    private const val KEY_OPEN_URL = "openUrl"
    private const val KEY_STOP_URL = "stopUrl"

    fun fromBundle(bundle: Bundle): Journey? {
      val entryId = bundle.getString(KEY_ENTRY_ID) ?: return null
      return Journey(
        entryId = entryId,
        title = bundle.getString(KEY_TITLE).orEmpty(),
        subtitle = bundle.getString(KEY_SUBTITLE).orEmpty(),
        startedAt = bundle.getLong(KEY_STARTED_AT),
        openUrl = bundle.getString(KEY_OPEN_URL).orEmpty(),
        stopUrl = bundle.getString(KEY_STOP_URL).orEmpty(),
      )
    }
  }
}
