package ns.silverfox.jarvisnative

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Opt-in foreground microphone service. It runs with a PERSISTENT, visible
 * notification so the user always knows the mic may be active — required for
 * "Hey Silverfox" wake-word listening.
 *
 * This service establishes the always-visible foreground lifecycle. The actual
 * wake-word engine (e.g. Picovoice Porcupine) is started/stopped here; see
 * docs/VOICE.md for wiring. It never records silently or without the
 * notification showing.
 */
class MicForegroundService : Service() {
  companion object {
    private const val CHANNEL_ID = "jarvis_listening"
    private const val NOTIF_ID = 7701
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    createChannel()
    val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("JARVIS is listening")
      .setContentText("Say \"Hey Silverfox\". Tap to stop.")
      .setSmallIcon(android.R.drawable.ic_btn_speak_now)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
    } else {
      startForeground(NOTIF_ID, notification)
    }

    // TODO (docs/VOICE.md): start the wake-word engine here.
    return START_STICKY
  }

  override fun onDestroy() {
    // TODO: stop the wake-word engine here.
    super.onDestroy()
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val mgr = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (mgr.getNotificationChannel(CHANNEL_ID) == null) {
        mgr.createNotificationChannel(
          NotificationChannel(CHANNEL_ID, "JARVIS listening", NotificationManager.IMPORTANCE_LOW)
        )
      }
    }
  }
}
