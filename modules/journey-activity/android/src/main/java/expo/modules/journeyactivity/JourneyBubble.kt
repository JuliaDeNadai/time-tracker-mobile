package expo.modules.journeyactivity

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.SystemClock
import android.text.TextUtils
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.widget.Chronometer
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.math.abs

/** Bolha arrastável sobreposta a outros apps; um toque expande as ações. */
class JourneyBubble(
  private val context: Context,
  private val journey: Journey,
  private val onOpen: () -> Unit,
  private val onStop: () -> Unit,
  private val onHide: () -> Unit,
) {
  private companion object {
    const val GREEN = 0xFF8EDF81.toInt()
    const val GREEN_DARK = 0xFF61B15A.toInt()
    const val TEXT_DARK = 0xFF42484A.toInt()
    const val TEXT_SOFT = 0xFF696969.toInt()
    const val DANGER = 0xFFFE697D.toInt()
    const val WHITE = 0xFFFFFFFF.toInt()
  }

  private val windowManager = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  private val density = context.resources.displayMetrics.density
  private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop

  private val params = WindowManager.LayoutParams(
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.WRAP_CONTENT,
    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
    PixelFormat.TRANSLUCENT,
  ).apply {
    gravity = Gravity.TOP or Gravity.START
    x = dp(12)
    y = dp(180)
  }

  private var root: LinearLayout? = null
  private var panel: View? = null

  private fun dp(value: Int) = (value * density).toInt()

  private fun rounded(color: Int, radius: Int) = GradientDrawable().apply {
    setColor(color)
    cornerRadius = dp(radius).toFloat()
  }

  fun show() {
    if (root != null) return
    val container = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      addView(buildPill())
      addView(buildPanel().also { panel = it })
    }
    root = container
    windowManager.addView(container, params)
  }

  fun remove() {
    root?.let { windowManager.removeView(it) }
    root = null
    panel = null
  }

  @SuppressLint("ClickableViewAccessibility")
  private fun buildPill(): View {
    val icon = ImageView(context).apply {
      setImageResource(R.drawable.journey_activity_ic_timer)
      setColorFilter(TEXT_DARK)
      layoutParams = LinearLayout.LayoutParams(dp(18), dp(18))
    }
    val chronometer = Chronometer(context).apply {
      base = SystemClock.elapsedRealtime() - (System.currentTimeMillis() - journey.startedAt)
      setTextColor(TEXT_DARK)
      textSize = 15f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      ).apply { marginStart = dp(6) }
      start()
    }

    return LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
      background = rounded(GREEN, 24)
      elevation = dp(6).toFloat()
      setPadding(dp(14), dp(10), dp(16), dp(10))
      addView(icon)
      addView(chronometer)
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      ).apply { setMargins(dp(8), dp(8), dp(8), dp(4)) }
      setOnTouchListener(DragListener())
    }
  }

  private fun buildPanel(): View {
    val title = TextView(context).apply {
      text = journey.title
      setTextColor(TEXT_DARK)
      textSize = 15f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      maxLines = 1
      ellipsize = TextUtils.TruncateAt.END
    }
    val subtitle = TextView(context).apply {
      text = journey.subtitle
      setTextColor(TEXT_SOFT)
      textSize = 13f
      maxLines = 1
      ellipsize = TextUtils.TruncateAt.END
    }
    val actions = LinearLayout(context).apply {
      orientation = LinearLayout.HORIZONTAL
      setPadding(0, dp(12), 0, 0)
      addView(actionButton("Ocultar", WHITE, TEXT_SOFT, onHide))
      addView(actionButton("Abrir", GREEN_DARK, WHITE, onOpen))
      addView(actionButton("Encerrar", DANGER, WHITE, onStop))
    }

    return LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      background = rounded(WHITE, 16)
      elevation = dp(6).toFloat()
      setPadding(dp(16), dp(14), dp(16), dp(14))
      visibility = View.GONE
      addView(title)
      addView(subtitle)
      addView(actions)
      layoutParams = LinearLayout.LayoutParams(dp(280), LinearLayout.LayoutParams.WRAP_CONTENT).apply {
        setMargins(dp(8), 0, dp(8), dp(8))
      }
    }
  }

  private fun actionButton(label: String, background: Int, textColor: Int, onClick: () -> Unit) =
    TextView(context).apply {
      text = label
      setTextColor(textColor)
      textSize = 14f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      gravity = Gravity.CENTER
      this.background = rounded(background, 18)
      setPadding(dp(8), dp(8), dp(8), dp(8))
      layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
        marginEnd = dp(6)
      }
      setOnClickListener { onClick() }
    }

  private fun togglePanel() {
    val panel = panel ?: return
    panel.visibility = if (panel.visibility == View.VISIBLE) View.GONE else View.VISIBLE
  }

  private inner class DragListener : View.OnTouchListener {
    private var startX = 0
    private var startY = 0
    private var touchX = 0f
    private var touchY = 0f
    private var dragging = false

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouch(view: View, event: MotionEvent): Boolean {
      when (event.action) {
        MotionEvent.ACTION_DOWN -> {
          startX = params.x
          startY = params.y
          touchX = event.rawX
          touchY = event.rawY
          dragging = false
        }
        MotionEvent.ACTION_MOVE -> {
          val dx = event.rawX - touchX
          val dy = event.rawY - touchY
          if (!dragging && (abs(dx) > touchSlop || abs(dy) > touchSlop)) dragging = true
          if (dragging) {
            params.x = startX + dx.toInt()
            params.y = startY + dy.toInt()
            root?.let { windowManager.updateViewLayout(it, params) }
          }
        }
        MotionEvent.ACTION_UP -> if (!dragging) togglePanel()
      }
      return true
    }
  }
}
