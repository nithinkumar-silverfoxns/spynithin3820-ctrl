package ns.silverfox.jarvisnative

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.os.BatteryManager
import android.os.Build
import android.provider.AlarmClock
import android.provider.MediaStore
import androidx.core.content.ContextCompat
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UnsupportedException(message: String) : CodedException("UNSUPPORTED", message, null)

class JarvisNativeModule : Module() {

  private val context: Context
    get() = appContext.reactContext ?: throw CodedException("NO_CONTEXT", "React context unavailable", null)

  override fun definition() = ModuleDefinition {
    Name("JarvisNative")

    AsyncFunction("getBattery") {
      val bm = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
      val level = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
      val charging = bm.isCharging
      mapOf("level" to level, "charging" to charging)
    }

    AsyncFunction("setTorch") { on: Boolean ->
      val cm = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
      val id = cm.cameraIdList.firstOrNull { camId ->
        cm.getCameraCharacteristics(camId)
          .get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
      } ?: throw UnsupportedException("No flash on this device")
      cm.setTorchMode(id, on)
      on
    }

    AsyncFunction("launchCamera") {
      val intent = Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    }

    AsyncFunction("setAlarm") { hour: Int, minute: Int, label: String ->
      val intent = Intent(AlarmClock.ACTION_SET_ALARM)
        .putExtra(AlarmClock.EXTRA_HOUR, hour)
        .putExtra(AlarmClock.EXTRA_MINUTES, minute)
        .putExtra(AlarmClock.EXTRA_MESSAGE, label)
        .putExtra(AlarmClock.EXTRA_SKIP_UI, false)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    }

    // Android has no system "reminders" API; route to the alarm/calendar UI.
    AsyncFunction("addReminder") { title: String, _dueISO: String? ->
      throw UnsupportedException("Use set_alarm or a Calendar event on Android")
    }

    AsyncFunction("openApp") { target: String ->
      val launch = context.packageManager.getLaunchIntentForPackage(target)
      if (launch != null) {
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(launch)
        true
      } else {
        // Fall back to treating it as a URI / deep link.
        val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(target))
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
        true
      }
    }

    AsyncFunction("startListeningService") {
      val intent = Intent(context, MicForegroundService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        ContextCompat.startForegroundService(context, intent)
      } else {
        context.startService(intent)
      }
      true
    }

    AsyncFunction("stopListeningService") {
      context.stopService(Intent(context, MicForegroundService::class.java))
      true
    }
  }
}
