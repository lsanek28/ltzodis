export interface AndroidSourceFile {
  path: string;
  module: string;
  language: 'kotlin' | 'gradle' | 'xml' | 'markdown';
  description: {
    uk: string;
    lt: string;
    en: string;
  };
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidSourceFile[] = [
  {
    path: 'app/build.gradle.kts',
    module: 'Gradle Build & Dependencies',
    language: 'gradle',
    description: {
      uk: 'Конфігурація модуля Android Studio: Kotlin, Jetpack Compose (Material 3), Room, DataStore, WorkManager (для фонових нагадувань), Kotlinx Serialization та JUnit тести.',
      lt: 'Android Studio modulio konfigūracija: Kotlin, Jetpack Compose (Material 3), Room, DataStore, WorkManager, Kotlinx Serialization ir JUnit.',
      en: 'Android Studio module configuration: Kotlin, Jetpack Compose (Material 3), Room, DataStore, WorkManager, Kotlinx Serialization, and JUnit.',
    },
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "lt.galunes.trainer"
    compileSdk = 35

    defaultConfig {
        applicationId = "lt.galunes.trainer"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2025.01.00")
    implementation(composeBom)
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Room Local Database (Offline-First)
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:\$roomVersion")
    implementation("androidx.room:room-ktx:\$roomVersion")
    ksp("androidx.room:room-compiler:\$roomVersion")

    // Jetpack DataStore (Language, Theme, Daily Goal & Reminder Settings)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // WorkManager for reliable background notification execution
    implementation("androidx.work:work-runtime-ktx:2.10.0")

    // JSON Seed Parsing
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")

    // Automated Unit Tests
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    module: 'Android Manifest & Permissions',
    language: 'xml',
    description: {
      uk: 'Маніфест Android-додатка: дозволи POST_NOTIFICATIONS (Android 13+), RECEIVE_BOOT_COMPLETED та BroadcastReceiver-и для перепланування щоденних нагадувань після перезавантаження пристрою або зміни часового поясу.',
      lt: 'Android programos manifestas: POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED leidimai ir BroadcastReceiver komponentai priminimams po perkrovimo ar laiko juostos pakeitimo.',
      en: 'Android Manifest: POST_NOTIFICATIONS (Android 13+), RECEIVE_BOOT_COMPLETED permissions, and BroadcastReceivers to reschedule reminders on boot or timezone change.',
    },
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Runtime Notification Permission required on Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Tactile Haptic Feedback (Vibration) for exercise answer evaluation -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Required to reschedule daily study alarms after device reboot -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- Optional exact alarm support when user grants exact alarm privilege -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <application
        android:name=".GalunesApplication"
        android:allowBackup="true"
        android:label="Lietuvių žodžių galūnės"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Triggered at the user's chosen local time to dispatch the study reminder -->
        <receiver
            android:name=".notifications.DailyReminderReceiver"
            android:enabled="true"
            android:exported="false" />

        <!-- Reschedules the daily study reminder after device reboot, app update, or clock/timezone change -->
        <receiver
            android:name=".notifications.RescheduleRemindersReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.LOCKED_BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.intent.action.TIME_SET" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/data/prefs/ReminderPreferencesRepository.kt',
    module: 'DataStore Reminder Preferences',
    language: 'kotlin',
    description: {
      uk: 'Збереження налаштувань щоденних нагадувань у Jetpack DataStore: увімкнення/вимкнення, вибрана година та хвилина, мова інтерфейсу й денна ціль.',
      lt: 'Kasdienių priminimų nustatymų saugojimas su Jetpack DataStore: įjungta/išjungta būsena, valanda ir minutė, kalba bei dienos tikslas.',
      en: 'Persistent storage for daily study reminder settings using Jetpack DataStore: enabled state, preferred hour/minute, UI language, and daily goal.',
    },
    code: `package lt.galunes.trainer.data.prefs

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_settings")

data class ReminderSettings(
    val enabled: Boolean = false,
    val hour: Int = 19,
    val minute: Int = 0,
    val language: String = "uk", // "uk", "lt", or "en"
    val dailyGoal: Int = 15,
    val soundEffectsEnabled: Boolean = true,
    val hapticFeedbackEnabled: Boolean = true
)

class ReminderPreferencesRepository(private val context: Context) {

    private object Keys {
        val REMINDER_ENABLED = booleanPreferencesKey("reminder_enabled")
        val REMINDER_HOUR = intPreferencesKey("reminder_hour")
        val REMINDER_MINUTE = intPreferencesKey("reminder_minute")
        val APP_LANGUAGE = stringPreferencesKey("app_language")
        val DAILY_GOAL = intPreferencesKey("daily_goal")
        val SOUND_EFFECTS_ENABLED = booleanPreferencesKey("sound_effects_enabled")
        val HAPTIC_FEEDBACK_ENABLED = booleanPreferencesKey("haptic_feedback_enabled")
    }

    val reminderSettingsFlow: Flow<ReminderSettings> = context.dataStore.data.map { prefs ->
        ReminderSettings(
            enabled = prefs[Keys.REMINDER_ENABLED] ?: false,
            hour = (prefs[Keys.REMINDER_HOUR] ?: 19).coerceIn(0, 23),
            minute = (prefs[Keys.REMINDER_MINUTE] ?: 0).coerceIn(0, 59),
            language = prefs[Keys.APP_LANGUAGE] ?: "uk",
            dailyGoal = prefs[Keys.DAILY_GOAL] ?: 15,
            soundEffectsEnabled = prefs[Keys.SOUND_EFFECTS_ENABLED] ?: true,
            hapticFeedbackEnabled = prefs[Keys.HAPTIC_FEEDBACK_ENABLED] ?: true
        )
    }

    suspend fun getSnapshot(): ReminderSettings = reminderSettingsFlow.first()

    suspend fun setReminderEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[Keys.REMINDER_ENABLED] = enabled
        }
    }

    suspend fun setReminderTime(hour: Int, minute: Int) {
        require(hour in 0..23) { "Hour must be in 0..23" }
        require(minute in 0..59) { "Minute must be in 0..59" }
        context.dataStore.edit { prefs ->
            prefs[Keys.REMINDER_HOUR] = hour
            prefs[Keys.REMINDER_MINUTE] = minute
        }
    }

    suspend fun setLanguage(languageCode: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.APP_LANGUAGE] = languageCode
        }
    }

    suspend fun setSoundEffectsEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[Keys.SOUND_EFFECTS_ENABLED] = enabled
        }
    }

    suspend fun setHapticFeedbackEnabled(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[Keys.HAPTIC_FEEDBACK_ENABLED] = enabled
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/feedback/AnswerFeedbackManager.kt',
    module: 'Native Offline Sound & Haptic Feedback (AudioTrack + Vibrator)',
    language: 'kotlin',
    description: {
      uk: 'Нативний модуль звукових ефектів і тактильної вібрації без інтернету: синтезує короткі приємні 16-бітні PCM-мелодії через AudioTrack (MODE_STATIC, USAGE_ASSISTANCE_SONIFICATION) та керує вібрацією через VibratorManager / VibrationEffect.',
      lt: 'Vietinis garso efektų ir vibracijos modulis be interneto: sintezuoja trumpus 16 bitų PCM garsus per AudioTrack ir valdo vibraciją per VibratorManager / VibrationEffect.',
      en: 'Native offline sound effects and tactile vibration manager: synthesizes short, gentle 16-bit PCM chimes in memory via AudioTrack (MODE_STATIC) and triggers VibrationEffect.',
    },
    code: `package lt.galunes.trainer.feedback

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

/**
 * 100% offline native Android feedback engine for exercise answers.
 * - Pre-synthesizes short, pleasant, low-volume PCM chimes in memory (zero network or external file dependencies).
 * - Preserves tactile vibration via VibratorManager / VibrationEffect.
 * - Respects independent soundEffectsEnabled and hapticFeedbackEnabled user settings.
 */
class AnswerFeedbackManager(context: Context) {

    private val appContext = context.applicationContext
    private val sampleRate = 24000

    // Pre-computed gentle 16-bit PCM buffers (~210ms)
    private val correctPcm: ShortArray = synthesizeTwoToneChime(
        freq1Hz = 523.25, // C5
        dur1Sec = 0.085,
        freq2Hz = 659.25, // E5
        dur2Sec = 0.135,
        amplitude = 0.16  // Subtle, non-intrusive volume
    )

    private val incorrectPcm: ShortArray = synthesizeTwoToneChime(
        freq1Hz = 220.00, // A3
        dur1Sec = 0.080,
        freq2Hz = 174.61, // F3
        dur2Sec = 0.120,
        amplitude = 0.14  // Soft, muted low-register cue
    )

    fun onAnswerEvaluated(
        isCorrect: Boolean,
        soundEffectsEnabled: Boolean,
        hapticFeedbackEnabled: Boolean
    ) {
        if (soundEffectsEnabled) {
            playSoundEffect(isCorrect)
        }
        if (hapticFeedbackEnabled) {
            triggerVibration(isCorrect)
        }
    }

    fun playSoundEffect(isCorrect: Boolean) {
        val pcmData = if (isCorrect) correctPcm else incorrectPcm
        try {
            val bufferSizeInBytes = pcmData.size * 2
            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(bufferSizeInBytes)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            audioTrack.write(pcmData, 0, pcmData.size)
            audioTrack.setNotificationMarkerPosition(pcmData.size)
            audioTrack.setPlaybackPositionUpdateListener(object : AudioTrack.OnPlaybackPositionUpdateListener {
                override fun onMarkerReached(track: AudioTrack?) {
                    track?.release()
                }
                override fun onPeriodicNotification(track: AudioTrack?) = Unit
            })
            audioTrack.play()
        } catch (_: Exception) {
            // Ignore if audio hardware is unavailable
        }
    }

    fun triggerVibration(isCorrect: Boolean) {
        try {
            val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val manager = appContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                manager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                appContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            if (vibrator == null || !vibrator.hasVibrator()) return

            if (isCorrect) {
                // Short, crisp single tactile pulse (18ms)
                val effect = VibrationEffect.createOneShot(18L, 95)
                vibrator.vibrate(effect)
            } else {
                // Subtle double pulse for incorrect answers
                val timings = longArrayOf(0L, 26L, 45L, 34L)
                val amplitudes = intArrayOf(0, 110, 0, 130)
                val effect = VibrationEffect.createWaveform(timings, amplitudes, -1)
                vibrator.vibrate(effect)
            }
        } catch (_: Exception) {
            // Ignore if vibration is restricted by system policy
        }
    }

    private fun synthesizeTwoToneChime(
        freq1Hz: Double,
        dur1Sec: Double,
        freq2Hz: Double,
        dur2Sec: Double,
        amplitude: Double
    ): ShortArray {
        val samples1 = (sampleRate * dur1Sec).toInt()
        val samples2 = (sampleRate * dur2Sec).toInt()
        val totalSamples = samples1 + samples2
        val output = ShortArray(totalSamples)
        val attackSamples = (sampleRate * 0.010).toInt().coerceAtLeast(1)

        for (i in 0 until totalSamples) {
            val isFirstNote = i < samples1
            val localIdx = if (isFirstNote) i else (i - samples1)
            val noteLen = if (isFirstNote) samples1 else samples2
            val freq = if (isFirstNote) freq1Hz else freq2Hz
            val t = localIdx.toDouble() / sampleRate

            // Smooth attack + exponential decay envelope (prevents clicking)
            val attackEnv = (localIdx.toDouble() / attackSamples).coerceAtMost(1.0)
            val decayEnv = exp(-4.5 * localIdx.toDouble() / noteLen)
            val env = attackEnv * decayEnv

            val wave = sin(2.0 * PI * freq * t)
            val sampleVal = (wave * env * amplitude * Short.MAX_VALUE).toInt()
                .coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt())
            output[i] = sampleVal.toShort()
        }
        return output
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/notifications/StudyNotificationHelper.kt',
    module: 'Android Notifications API Helper',
    language: 'kotlin',
    description: {
      uk: 'Створення NotificationChannel (API 26+), перевірка дозволу POST_NOTIFICATIONS, локалізація тексту нагадування трьома мовами (UK/LT/EN) та відкриття екрана практики при натисканні.',
      lt: 'NotificationChannel kūrimas (API 26+), POST_NOTIFICATIONS leidimo tikrinimas, pranešimo teksto lokalizavimas (UK/LT/EN) ir treniruotės ekrano atidarymas.',
      en: 'NotificationChannel setup (API 26+), POST_NOTIFICATIONS permission check, trilingual study reminder copy (UK/LT/EN), and PendingIntent deep-link to practice.',
    },
    code: `package lt.galunes.trainer.notifications

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

object StudyNotificationHelper {

    const val CHANNEL_ID = "daily_lithuanian_endings_reminder"
    const val NOTIFICATION_ID = 1001
    const val EXTRA_OPEN_PRACTICE = "extra_open_practice_tab"

    /**
     * Registers the notification channel on Android 8.0+ (API 26+).
     * Safe to call repeatedly on app startup and before posting a notification.
     */
    fun ensureChannelCreated(context: Context, language: String = "uk") {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = when (language) {
                "lt" -> "Kasdieniai mokymosi priminimai"
                "en" -> "Daily Study Reminders"
                else -> "Щоденні нагадування про навчання"
            }
            val channelDesc = when (language) {
                "lt" -> "Priminimai kasdien pasipraktikuoti lietuvių kalbos daiktavardžių galūnes"
                "en" -> "Daily notifications to complete your Lithuanian noun-ending practice"
                else -> "Нагадування про щоденне тренування закінчень литовських іменників"
            }

            val channel = NotificationChannel(
                CHANNEL_ID,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = channelDesc
                enableVibration(true)
            }

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    /**
     * Checks whether the app currently holds runtime permission to post notifications.
     */
    fun canPostNotifications(context: Context): Boolean {
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return false
        }
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    /**
     * Builds and dispatches the daily Lithuanian word-ending practice notification.
     */
    fun showDailyReminderNotification(
        context: Context,
        language: String,
        dailyGoal: Int
    ): Boolean {
        ensureChannelCreated(context, language)
        if (!canPostNotifications(context)) {
            return false
        }

        val (title, body) = when (language) {
            "lt" -> Pair(
                "Lietuvių žodžių galūnės · Laikas treniruotei!",
                "Skirkite kelias minutes lietuvių kalbos daiktavardžių galūnių praktikai (dienos tikslas: \$dailyGoal pratimų)."
            )
            "en" -> Pair(
                "Lietuvių žodžių galūnės · Time to practice!",
                "Take a few minutes to complete your Lithuanian word-ending practice (daily goal: \$dailyGoal exercises)."
            )
            else -> Pair(
                "Lietuvių žodžių galūnės · Час для практики!",
                "Приділіть кілька хвилин відмінюванню литовських іменників і закріпіть закінчення (денна ціль: \$dailyGoal вправ)."
            )
        }

        val launchIntent = context.packageManager
            .getLaunchIntentForPackage(context.packageName)
            ?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(EXTRA_OPEN_PRACTICE, true)
            } ?: Intent().apply {
                setClassName(context.packageName, "lt.galunes.trainer.MainActivity")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra(EXTRA_OPEN_PRACTICE, true)
            }

        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        return try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
            true
        } catch (_: SecurityException) {
            false
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/notifications/DailyReminderScheduler.kt',
    module: 'AlarmManager + WorkManager Scheduler',
    language: 'kotlin',
    description: {
      uk: 'Надійний планувальник щоденних нагадувань: обчислює наступний час у локальному часовому поясі (ZonedDateTime), планує будильник через AlarmManager (setExactAndAllowWhileIdle / setAndAllowWhileIdle) та резервну задачу WorkManager.',
      lt: 'Patikimas kasdienių priminimų planuoklis: apskaičiuoja kitą laiką vietinėje laiko juostoje (ZonedDateTime) ir derina AlarmManager su WorkManager.',
      en: 'Reliable daily scheduler: computes the next trigger in local time (ZonedDateTime), schedules Doze-aware AlarmManager alarms, and coordinates with WorkManager.',
    },
    code: `package lt.galunes.trainer.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.work.*
import java.time.Duration
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.concurrent.TimeUnit

object DailyReminderScheduler {

    private const val ALARM_REQUEST_CODE = 2001
    private const val UNIQUE_WORK_NAME = "daily_lithuanian_study_reminder_work"

    /**
     * Pure calculation of the next occurrence of (hour, minute) in the user's local timezone.
     * If the target time today has already passed (or is equal to now), schedules for tomorrow.
     * Automatically respects Daylight Saving Time (DST) and timezone changes.
     */
    fun computeNextTriggerEpochMillis(
        hour: Int,
        minute: Int,
        now: ZonedDateTime = ZonedDateTime.now(ZoneId.systemDefault())
    ): Long {
        var candidate = now
            .withHour(hour.coerceIn(0, 23))
            .withMinute(minute.coerceIn(0, 59))
            .withSecond(0)
            .withNano(0)

        if (!candidate.isAfter(now)) {
            candidate = candidate.plusDays(1)
        }
        return candidate.toInstant().toEpochMilli()
    }

    /**
     * Schedules the daily reminder for the user's preferred local time (hour:minute).
     * Uses AlarmManager (Doze-aware) as primary trigger and WorkManager OneTimeWorkRequest
     * as a resilient background execution guarantee.
     */
    fun scheduleDailyReminder(context: Context, hour: Int, minute: Int) {
        val appContext = context.applicationContext
        val now = ZonedDateTime.now(ZoneId.systemDefault())
        val triggerAtMillis = computeNextTriggerEpochMillis(hour, minute, now)
        val delayMillis = (triggerAtMillis - now.toInstant().toEpochMilli()).coerceAtLeast(1_000L)

        // 1. Primary exact/windowed Doze-aware alarm via AlarmManager
        val alarmManager = appContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildAlarmPendingIntent(appContext, PendingIntent.FLAG_UPDATE_CURRENT)

        if (pendingIntent != null) {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (alarmManager.canScheduleExactAlarms()) {
                        alarmManager.setExactAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                        )
                    } else {
                        // Reliable fallback when exact alarm special access is not granted
                        alarmManager.setAndAllowWhileIdle(
                            AlarmManager.RTC_WAKEUP,
                            triggerAtMillis,
                            pendingIntent
                        )
                    }
                } else {
                    alarmManager.setExactAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } catch (_: SecurityException) {
                alarmManager.setAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    triggerAtMillis,
                    pendingIntent
                )
            }
        }

        // 2. Complementary WorkManager task so reminder still fires if OEM restricts AlarmManager
        val workRequest = OneTimeWorkRequestBuilder<DailyReminderWorker>()
            .setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
            .addTag(UNIQUE_WORK_NAME)
            .build()

        WorkManager.getInstance(appContext).enqueueUniqueWork(
            UNIQUE_WORK_NAME,
            ExistingWorkPolicy.REPLACE,
            workRequest
        )
    }

    /**
     * Cancels both AlarmManager and WorkManager scheduled reminders when the user disables reminders.
     */
    fun cancelDailyReminder(context: Context) {
        val appContext = context.applicationContext
        val alarmManager = appContext.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pendingIntent = buildAlarmPendingIntent(appContext, PendingIntent.FLAG_NO_CREATE)
        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent)
            pendingIntent.cancel()
        }
        WorkManager.getInstance(appContext).cancelUniqueWork(UNIQUE_WORK_NAME)
    }

    private fun buildAlarmPendingIntent(context: Context, extraFlags: Int): PendingIntent? {
        val intent = Intent(context, DailyReminderReceiver::class.java).apply {
            action = DailyReminderReceiver.ACTION_TRIGGER_DAILY_REMINDER
        }
        return PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE,
            intent,
            extraFlags or PendingIntent.FLAG_IMMUTABLE
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/notifications/DailyReminderReceivers.kt',
    module: 'BroadcastReceivers & WorkManager Worker',
    language: 'kotlin',
    description: {
      uk: 'BroadcastReceiver-и та CoroutineWorker: показ сповіщення у фоновому режимі (навіть коли додаток закритий) і автоматичне перепланування при перезавантаженні пристрою (BOOT_COMPLETED) або зміні часу/часового поясу.',
      lt: 'BroadcastReceiver ir CoroutineWorker: pranešimo rodymas fone (net kai programa uždaryta) ir automatinis perplanavimas po įrenginio perkrovimo ar laiko juostos pakeitimo.',
      en: 'BroadcastReceivers & CoroutineWorker: background notification dispatch when the app is closed and automatic rescheduling on BOOT_COMPLETED, TIME_SET, and TIMEZONE_CHANGED.',
    },
    code: `package lt.galunes.trainer.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import lt.galunes.trainer.data.prefs.ReminderPreferencesRepository
import java.time.LocalDate

/**
 * Triggered by AlarmManager at the user's preferred local study time.
 * Enqueues expedited/one-time WorkManager work and schedules tomorrow's alarm.
 */
class DailyReminderReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val repo = ReminderPreferencesRepository(context.applicationContext)
                val settings = repo.getSnapshot()
                if (settings.enabled) {
                    StudyNotificationHelper.showDailyReminderNotification(
                        context = context.applicationContext,
                        language = settings.language,
                        dailyGoal = settings.dailyGoal
                    )
                    // Schedule the next day's occurrence in local time
                    DailyReminderScheduler.scheduleDailyReminder(
                        context = context.applicationContext,
                        hour = settings.hour,
                        minute = settings.minute
                    )
                }
            } finally {
                pendingResult.finish()
            }
        }
    }

    companion object {
        const val ACTION_TRIGGER_DAILY_REMINDER =
            "lt.galunes.trainer.action.TRIGGER_DAILY_REMINDER"
    }
}

/**
 * Listens for device reboot (BOOT_COMPLETED), app updates (MY_PACKAGE_REPLACED),
 * and clock or timezone changes (TIME_SET, TIMEZONE_CHANGED) to recalculate
 * and reschedule the daily reminder in the user's current local time.
 */
class RescheduleRemindersReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return
        val supportedActions = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            "android.intent.action.LOCKED_BOOT_COMPLETED",
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED
        )
        if (action !in supportedActions) return

        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val repo = ReminderPreferencesRepository(context.applicationContext)
                val settings = repo.getSnapshot()
                if (settings.enabled) {
                    DailyReminderScheduler.scheduleDailyReminder(
                        context = context.applicationContext,
                        hour = settings.hour,
                        minute = settings.minute
                    )
                } else {
                    DailyReminderScheduler.cancelDailyReminder(context.applicationContext)
                }
            } finally {
                pendingResult.finish()
            }
        }
    }
}

/**
 * WorkManager CoroutineWorker that ensures the daily study reminder is posted
 * and rescheduled for the following day even under strict background execution limits.
 */
class DailyReminderWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val repo = ReminderPreferencesRepository(applicationContext)
        val settings = repo.getSnapshot()
        if (!settings.enabled) {
            return Result.success()
        }

        // Deduplicate so AlarmManager + WorkManager never double-post on the same day
        val prefs = applicationContext.getSharedPreferences("reminder_dedup", Context.MODE_PRIVATE)
        val todayIso = LocalDate.now().toString()
        val lastSentDate = prefs.getString("last_sent_date", null)

        if (lastSentDate != todayIso) {
            val posted = StudyNotificationHelper.showDailyReminderNotification(
                context = applicationContext,
                language = settings.language,
                dailyGoal = settings.dailyGoal
            )
            if (posted) {
                prefs.edit().putString("last_sent_date", todayIso).apply()
            }
        }

        // Schedule next day's reminder
        DailyReminderScheduler.scheduleDailyReminder(
            context = applicationContext,
            hour = settings.hour,
            minute = settings.minute
        )
        return Result.success()
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/ui/ReminderSettingsCard.kt',
    module: 'Jetpack Compose Reminder UI & Permission Flow',
    language: 'kotlin',
    description: {
      uk: 'Jetpack Compose компонент налаштування щоденного нагадування: перемикач, вибір часу (Material 3 TimePicker), запит дозволу POST_NOTIFICATIONS на Android 13+ та збереження у DataStore.',
      lt: 'Jetpack Compose priminimų nustatymų komponentas: jungiklis, laiko parinkiklis (Material 3 TimePicker), POST_NOTIFICATIONS leidimo užklausa ir saugojimas į DataStore.',
      en: 'Jetpack Compose reminder settings card: enable/disable Switch, Material 3 TimePicker dialog, Android 13+ POST_NOTIFICATIONS permission launcher, and DataStore persistence.',
    },
    code: `package lt.galunes.trainer.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import kotlinx.coroutines.launch
import lt.galunes.trainer.data.prefs.ReminderPreferencesRepository
import lt.galunes.trainer.data.prefs.ReminderSettings
import lt.galunes.trainer.notifications.DailyReminderScheduler
import lt.galunes.trainer.notifications.StudyNotificationHelper
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReminderSettingsCard(
    repository: ReminderPreferencesRepository,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val settings by repository.reminderSettingsFlow.collectAsState(initial = ReminderSettings())

    var showTimePicker by remember { mutableStateOf(false) }
    var permissionDeniedBanner by remember { mutableStateOf(false) }

    // Runtime permission launcher for Android 13+ (API 33+)
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        scope.launch {
            if (isGranted) {
                permissionDeniedBanner = false
                repository.setReminderEnabled(true)
                StudyNotificationHelper.ensureChannelCreated(context, settings.language)
                DailyReminderScheduler.scheduleDailyReminder(
                    context = context,
                    hour = settings.hour,
                    minute = settings.minute
                )
            } else {
                permissionDeniedBanner = true
                repository.setReminderEnabled(false)
                DailyReminderScheduler.cancelDailyReminder(context)
            }
        }
    }

    val formattedTime = remember(settings.hour, settings.minute) {
        String.format(Locale.getDefault(), "%02d:%02d", settings.hour, settings.minute)
    }

    OutlinedCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Kasdienis mokymosi priminimas"
                            "en" -> "Daily Study Reminder"
                            else -> "Щоденне нагадування про навчання"
                        },
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Priminti praktikuoti lietuvių žodžių galūnes pasirinktu laiku"
                            "en" -> "Remind me to complete my Lithuanian word-ending practice"
                            else -> "Нагадувати про практику закінчень литовських слів у вибраний час"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Switch(
                    checked = settings.enabled,
                    onCheckedChange = { shouldEnable ->
                        if (shouldEnable) {
                            val needsRuntimePermission =
                                Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                                    ContextCompat.checkSelfPermission(
                                        context,
                                        Manifest.permission.POST_NOTIFICATIONS
                                    ) != PackageManager.PERMISSION_GRANTED

                            if (needsRuntimePermission) {
                                notificationPermissionLauncher.launch(
                                    Manifest.permission.POST_NOTIFICATIONS
                                )
                            } else {
                                permissionDeniedBanner = false
                                scope.launch {
                                    repository.setReminderEnabled(true)
                                    StudyNotificationHelper.ensureChannelCreated(context, settings.language)
                                    DailyReminderScheduler.scheduleDailyReminder(
                                        context = context,
                                        hour = settings.hour,
                                        minute = settings.minute
                                    )
                                }
                            }
                        } else {
                            scope.launch {
                                repository.setReminderEnabled(false)
                                DailyReminderScheduler.cancelDailyReminder(context)
                            }
                        }
                    }
                )
            }

            HorizontalDivider()

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = when (settings.language) {
                        "lt" -> "Priminimo laikas (vietinis laikas)"
                        "en" -> "Reminder time (local time)"
                        else -> "Час нагадування (місцевий час)"
                    },
                    style = MaterialTheme.typography.bodyMedium
                )

                OutlinedButton(onClick = { showTimePicker = true }) {
                    Text(
                        text = formattedTime,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            if (permissionDeniedBanner) {
                Text(
                    text = when (settings.language) {
                        "lt" -> "Pranešimų leidimas atmestas. Įjunkite pranešimus Android nustatymuose."
                        "en" -> "Notification permission denied. Please enable notifications in Android Settings."
                        else -> "Дозвіл на сповіщення відхилено. Увімкніть сповіщення в налаштуваннях Android."
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error
                )
            }

            HorizontalDivider()

            // Sound Effects Independent Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Atsakymų garso efektai"
                            "en" -> "Answer sound effects"
                            else -> "Звукові ефекти відповідей"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Trumpi, švelnūs garsai be interneto"
                            "en" -> "Short, pleasant offline chimes"
                            else -> "Короткі приємні звуки без підключення до інтернету"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Switch(
                    checked = settings.soundEffectsEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            repository.setSoundEffectsEnabled(enabled)
                        }
                    }
                )
            }

            // Tactile Vibration Independent Toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Vibracija (lytėjimo atsakas)"
                            "en" -> "Vibration (haptic feedback)"
                            else -> "Вібрація (тактильний зворотний зв’язок)"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = when (settings.language) {
                            "lt" -> "Švelni vibracija tikrinant atsakymą"
                            "en" -> "Subtle vibration when checking answers"
                            else -> "Легка вібрація при перевірці правильних і неправильних відповідей"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Switch(
                    checked = settings.hapticFeedbackEnabled,
                    onCheckedChange = { enabled ->
                        scope.launch {
                            repository.setHapticFeedbackEnabled(enabled)
                        }
                    }
                )
            }
        }
    }

    if (showTimePicker) {
        val timePickerState = rememberTimePickerState(
            initialHour = settings.hour,
            initialMinute = settings.minute,
            is24Hour = true
        )

        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            confirmButton = {
                TextButton(
                    onClick = {
                        val newHour = timePickerState.hour
                        val newMinute = timePickerState.minute
                        showTimePicker = false
                        scope.launch {
                            repository.setReminderTime(newHour, newMinute)
                            if (settings.enabled) {
                                DailyReminderScheduler.scheduleDailyReminder(
                                    context = context,
                                    hour = newHour,
                                    minute = newMinute
                                )
                            }
                        }
                    }
                ) {
                    Text("OK")
                }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) {
                    Text(
                        when (settings.language) {
                            "lt" -> "Atšaukti"
                            "en" -> "Cancel"
                            else -> "Скасувати"
                        }
                    )
                }
            },
            text = {
                TimePicker(state = timePickerState)
            }
        )
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/data/db/Entities.kt',
    module: 'Room Database Entities',
    language: 'kotlin',
    description: {
      uk: 'Таблиці бази даних Room: NounEntity (всі 14 перевірених форм однини й множини, тип відмінювання, переклади, чергування основи) та UserWordProgressEntity.',
      lt: 'Room duomenų bazės lentelės: NounEntity (visos 14 patikrintų vns. ir dgs. formų, linksniuotė, vertimai) ir UserWordProgressEntity.',
      en: 'Room database entities: NounEntity (all 14 verified singular/plural forms, declension type, translations) and UserWordProgressEntity.',
    },
    code: `package lt.galunes.trainer.data.db

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "nouns",
    indices = [
        Index(value = ["lemma"], unique = true),
        Index(value = ["declension"]),
        Index(value = ["topic"]),
        Index(value = ["difficulty"])
    ]
)
data class NounEntity(
    @PrimaryKey val id: String,
    val lemma: String,
    val translationUk: String,
    val translationEn: String,
    val topic: String,
    val declension: Int,        // 1..5 linksniuotė
    val subtype: String,        // 1_as, 1_ias, 1_is, 1_ys, 2_a, 2_ia, 2_e, 3_is_f, 3_is_m, 4_us, 4_ius, 5_uo, 5_e
    val gender: String,         // "m" or "f"
    val difficulty: Int,        // 1..4
    val frequency: Int,
    val verified: Boolean,
    val stemAlternationUk: String?,
    val stemAlternationLt: String?,
    val stemAlternationEn: String?,
    // Explicit Verified Singular Forms (Vienaskaita)
    val sgNom: String,
    val sgGen: String,
    val sgDat: String,
    val sgAcc: String,
    val sgIns: String,
    val sgLoc: String,
    val sgVoc: String,
    // Explicit Verified Plural Forms (Daugiskaita)
    val plNom: String,
    val plGen: String,
    val plDat: String,
    val plAcc: String,
    val plIns: String,
    val plLoc: String,
    val plVoc: String
)

@Entity(tableName = "word_progress")
data class UserWordProgressEntity(
    @PrimaryKey val wordId: String,
    val correctCount: Int = 0,
    val incorrectCount: Int = 0,
    val consecutiveCorrect: Int = 0,
    val distinctSessionsCount: Int = 0,
    val lastSessionDate: String = "",
    val mastered: Boolean = false,
    val isFavorite: Boolean = false
)

@Entity(tableName = "mistake_history")
data class MistakeHistoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val wordId: String,
    val lemma: String,
    val targetCase: String,
    val targetNumber: String,
    val userAnswer: String,
    val correctAnswer: String,
    val timestampEpochMillis: Long
)`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/data/db/AppDatabase.kt',
    module: 'Room DAO & Prepopulation',
    language: 'kotlin',
    description: {
      uk: 'DAO-запити для усіх 9 режимів навчання та RoomDatabase.Callback для первинного заповнення бази з локального JSON-файлу без інтернету.',
      lt: 'DAO užklausos visiems 9 mokymosi režimams ir RoomDatabase.Callback pradiniam duomenų bazės užpildymui be interneto.',
      en: 'Room DAOs for all 9 training modes and RoomDatabase.Callback for offline initial database population from assets.',
    },
    code: `package lt.galunes.trainer.data.db

import android.content.Context
import androidx.room.*
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

@Dao
interface NounDao {
    @Query("SELECT * FROM nouns WHERE verified = 1 ORDER BY frequency DESC")
    fun observeAllVerifiedNouns(): Flow<List<NounEntity>>

    @Query("SELECT * FROM nouns WHERE verified = 1 AND declension = :declension")
    suspend fun getNounsByDeclension(declension: Int): List<NounEntity>

    @Query("SELECT * FROM nouns WHERE verified = 1 AND topic = :topic")
    suspend fun getNounsByTopic(topic: String): List<NounEntity>

    @Query("""
        SELECT * FROM nouns 
        WHERE verified = 1 AND (
            lemma LIKE '%' || :query || '%' 
            OR translationUk LIKE '%' || :query || '%' 
            OR translationEn LIKE '%' || :query || '%'
        )
        ORDER BY frequency DESC
    """)
    fun searchNouns(query: String): Flow<List<NounEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(nouns: List<NounEntity>)
}

@Database(
    entities = [NounEntity::class, UserWordProgressEntity::class, MistakeHistoryEntity::class],
    version = 1,
    exportSchema = true
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun nounDao(): NounDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "lietuviu_galunes.db"
                )
                .addCallback(PrepopulateCallback(context, scope))
                .build()
                .also { INSTANCE = it }
            }
        }
    }

    private class PrepopulateCallback(
        private val context: Context,
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            scope.launch(Dispatchers.IO) {
                val jsonText = context.assets.open("nouns_verified_150.json")
                    .bufferedReader(Charsets.UTF_8)
                    .use { it.readText() }
                val entities = SeedParser.parseAndValidateNouns(jsonText)
                INSTANCE?.nounDao()?.insertAll(entities)
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/domain/AnswerEvaluator.kt',
    module: 'Grammar Answer Validation Engine',
    language: 'kotlin',
    description: {
      uk: 'Модуль перевірки введених відповідей: точна перевірка за базою даних, збереження литовських діакритиків (ą, č, ę, ė, į, š, ų, ū, ž), виділення основи та закінчення й діагностика помилкового відмінка.',
      lt: 'Atsakymų tikrinimo modulis: tiksli patikra pagal DB, lietuviškų diakritinių raidžių kontrolė, kamieno ir galūnės išskyrimas.',
      en: 'Answer evaluation engine: exact form verification, strict Lithuanian diacritic handling, stem/ending segmentation, and confused-case detection.',
    },
    code: `package lt.galunes.trainer.domain

import lt.galunes.trainer.data.db.NounEntity

enum class GrammaticalCase(val questionLt: String) {
    NOM("Kas?"),
    GEN("Ko?"),
    DAT("Kam?"),
    ACC("Ką?"),
    INS("Kuo?"),
    LOC("Kur? Kame?"),
    VOC("Šauksmininkas (!)")
}

enum class GrammaticalNumber { SG, PL }

data class SegmentedWord(val stem: String, val ending: String)

data class EvaluationResult(
    val isCorrect: Boolean,
    val normalizedUserInput: String,
    val expectedForm: String,
    val expectedSegmented: SegmentedWord,
    val userSegmented: SegmentedWord?,
    val hasDiacriticMismatchOnly: Boolean,
    val confusedWithCase: Pair<GrammaticalCase, GrammaticalNumber>?
)

object AnswerEvaluator {
    private val diacriticFoldMap = mapOf(
        'ą' to 'a', 'č' to 'c', 'ę' to 'e', 'ė' to 'e',
        'į' to 'i', 'š' to 's', 'ų' to 'u', 'ū' to 'u', 'ž' to 'z'
    )

    fun stripDiacritics(text: String): String =
        text.lowercase().map { diacriticFoldMap[it] ?: it }.joinToString("")

    fun getExpectedForm(
        noun: NounEntity,
        targetCase: GrammaticalCase,
        targetNumber: GrammaticalNumber
    ): String = when (targetNumber) {
        GrammaticalNumber.SG -> when (targetCase) {
            GrammaticalCase.NOM -> noun.sgNom
            GrammaticalCase.GEN -> noun.sgGen
            GrammaticalCase.DAT -> noun.sgDat
            GrammaticalCase.ACC -> noun.sgAcc
            GrammaticalCase.INS -> noun.sgIns
            GrammaticalCase.LOC -> noun.sgLoc
            GrammaticalCase.VOC -> noun.sgVoc
        }
        GrammaticalNumber.PL -> when (targetCase) {
            GrammaticalCase.NOM -> noun.plNom
            GrammaticalCase.GEN -> noun.plGen
            GrammaticalCase.DAT -> noun.plDat
            GrammaticalCase.ACC -> noun.plAcc
            GrammaticalCase.INS -> noun.plIns
            GrammaticalCase.LOC -> noun.plLoc
            GrammaticalCase.VOC -> noun.plVoc
        }
    }

    fun evaluate(
        noun: NounEntity,
        targetCase: GrammaticalCase,
        targetNumber: GrammaticalNumber,
        rawInput: String
    ): EvaluationResult {
        val cleanInput = rawInput.trim().lowercase()
        val expected = getExpectedForm(noun, targetCase, targetNumber).lowercase()
        val isCorrect = cleanInput == expected

        val expectedSeg = segmentWord(expected)
        val userSeg = if (cleanInput.isNotEmpty()) {
            if (cleanInput.startsWith(expectedSeg.stem) && cleanInput.length > expectedSeg.stem.length) {
                SegmentedWord(expectedSeg.stem, cleanInput.substring(expectedSeg.stem.length))
            } else {
                segmentWord(cleanInput)
            }
        } else null

        val hasDiacriticMismatchOnly = !isCorrect &&
            cleanInput.isNotEmpty() &&
            stripDiacritics(cleanInput) == stripDiacritics(expected)

        var confusedWith: Pair<GrammaticalCase, GrammaticalNumber>? = null
        if (!isCorrect && cleanInput.isNotEmpty()) {
            for (num in GrammaticalNumber.entries) {
                for (c in GrammaticalCase.entries) {
                    if (num == targetNumber && c == targetCase) continue
                    if (getExpectedForm(noun, c, num).lowercase() == cleanInput) {
                        confusedWith = c to num
                        break
                    }
                }
            }
        }

        return EvaluationResult(
            isCorrect = isCorrect,
            normalizedUserInput = cleanInput,
            expectedForm = expected,
            expectedSegmented = expectedSeg,
            userSegmented = userSeg,
            hasDiacriticMismatchOnly = hasDiacriticMismatchOnly,
            confusedWithCase = confusedWith
        )
    }

    fun segmentWord(form: String): SegmentedWord {
        val knownEndings = listOf(
            "enyje", "eryje", "enimis", "erimis", "enyse", "eryse", "eniui", "eriai",
            "iuose", "uose", "ioje", "oje", "ėje", "yje", "uje", "yse", "ose", "ėse",
            "iams", "ioms", "imis", "omis", "ėmis", "umis", "iais", "iaus", "iumi",
            "ams", "oms", "ėms", "ims", "ums", "ais", "aus", "umi", "ies", "iui",
            "ens", "ers", "enį", "erį", "enys", "erys", "enų", "erų", "enis", "eris",
            "ias", "ios", "iai", "ius", "au", "ie", "uo",
            "as", "is", "ys", "us", "os", "ės", "ai", "ei", "ui",
            "ą", "ę", "į", "ų", "ū", "ė", "a", "e", "i", "o", "u", "y"
        )
        for (ending in knownEndings) {
            if (form.endsWith(ending) && form.length > ending.length) {
                return SegmentedWord(
                    stem = form.substring(0, form.length - ending.length),
                    ending = ending
                )
            }
        }
        return SegmentedWord(form.dropLast(1), form.takeLast(1))
    }
}`,
  },
  {
    path: 'app/src/main/java/lt/galunes/trainer/ui/PracticeScreen.kt',
    module: 'Jetpack Compose Exercise UI',
    language: 'kotlin',
    description: {
      uk: 'Екран тренування на Jetpack Compose: відображення початкового слова, перекладу, потрібного відмінка, литовських діакритичних кнопок (ą, č, ę, ė, į, š, ų, ū, ž) та кольорового розбору основи й закінчення.',
      lt: 'Treniruotės ekranas su Jetpack Compose: pradinis žodis, vertimas, reikiamas linksnis, lietuviškų raidžių juosta ir spalvinis kamieno bei galūnės išskyrimas.',
      en: 'Jetpack Compose Exercise Screen: displays base word, translation, target case, Lithuanian diacritic bar, and color-coded stem vs. ending feedback.',
    },
    code: `package lt.galunes.trainer.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp

@Composable
fun StemEndingHighlightedText(
    stem: String,
    ending: String,
    isCorrect: Boolean
) {
    val endingColor = if (isCorrect) Color(0xFF059669) else Color(0xFFDC2626)
    Text(
        text = buildAnnotatedString {
            withStyle(SpanStyle(color = Color(0xFF0F172A), fontWeight = FontWeight.SemiBold)) {
                append(stem)
            }
            withStyle(
                SpanStyle(
                    color = endingColor,
                    fontWeight = FontWeight.Bold,
                    background = endingColor.copy(alpha = 0.14f)
                )
            ) {
                append(ending)
            }
        },
        style = MaterialTheme.typography.headlineMedium
    )
}

@Composable
fun LithuanianDiacriticRow(
    onCharacterClick: (Char) -> Unit
) {
    val chars = listOf('ą', 'č', 'ę', 'ė', 'į', 'š', 'ų', 'ū', 'ž')
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        chars.forEach { ch ->
            OutlinedButton(
                onClick = { onCharacterClick(ch) },
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                Text(text = ch.toString(), style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}`,
  },
  {
    path: 'app/src/test/java/lt/galunes/trainer/GrammarEvaluatorTest.kt',
    module: 'Automated JUnit Tests (Grammar & Reminder Scheduling)',
    language: 'kotlin',
    description: {
      uk: 'Автоматичні модульні тести JUnit для перевірки граматичних форм, литовських діакритиків, діагностики помилок та розрахунку локального часу щоденних нагадувань (DailyReminderScheduler).',
      lt: 'Automatiniai JUnit testai gramatinėms formoms, diakritinėms raidėms ir kasdienių priminimų vietinio laiko skaičiavimui (DailyReminderScheduler) patikrinti.',
      en: 'Automated JUnit unit tests verifying grammatical forms, Lithuanian diacritics, mistake diagnostics, and DailyReminderScheduler local-time calculations.',
    },
    code: `package lt.galunes.trainer

import lt.galunes.trainer.data.db.NounEntity
import lt.galunes.trainer.domain.AnswerEvaluator
import lt.galunes.trainer.domain.GrammaticalCase
import lt.galunes.trainer.domain.GrammaticalNumber
import lt.galunes.trainer.notifications.DailyReminderScheduler
import org.junit.Assert.*
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

class GrammarEvaluatorTest {
    private val knyga = NounEntity(
        id = "lt_076", lemma = "knyga", translationUk = "книга", translationEn = "book",
        topic = "school", declension = 2, subtype = "2_a", gender = "f",
        difficulty = 1, frequency = 100, verified = true,
        stemAlternationUk = null, stemAlternationLt = null, stemAlternationEn = null,
        sgNom = "knyga", sgGen = "knygos", sgDat = "knygai", sgAcc = "knygą",
        sgIns = "knyga", sgLoc = "knygoje", sgVoc = "knyga",
        plNom = "knygos", plGen = "knygų", plDat = "knygoms", plAcc = "knygas",
        plIns = "knygomis", plLoc = "knygose", plVoc = "knygos"
    )

    @Test
    fun \`prompt example - knyga in Genitive Singular rejects knygą and detects Accusative\`() {
        val result = AnswerEvaluator.evaluate(
            noun = knyga,
            targetCase = GrammaticalCase.GEN,
            targetNumber = GrammaticalNumber.SG,
            rawInput = "knygą"
        )
        assertFalse(result.isCorrect)
        assertEquals("knygos", result.expectedForm)
        assertEquals("knyg", result.expectedSegmented.stem)
        assertEquals("os", result.expectedSegmented.ending)
        assertEquals(GrammaticalCase.ACC to GrammaticalNumber.SG, result.confusedWithCase)
    }

    @Test
    fun \`diacritic sensitivity - knyga is not accepted for Accusative knygą\`() {
        val wrong = AnswerEvaluator.evaluate(knyga, GrammaticalCase.ACC, GrammaticalNumber.SG, "knyga")
        assertFalse(wrong.isCorrect)
        assertTrue(wrong.hasDiacriticMismatchOnly)

        val right = AnswerEvaluator.evaluate(knyga, GrammaticalCase.ACC, GrammaticalNumber.SG, "  Knygą ")
        assertTrue(right.isCorrect)
    }

    @Test
    fun \`daily reminder schedules for today when target local time is still ahead\`() {
        val vilniusZone = ZoneId.of("Europe/Vilnius")
        val now = ZonedDateTime.of(2026, 10, 24, 14, 15, 0, 0, vilniusZone)

        val triggerMillis = DailyReminderScheduler.computeNextTriggerEpochMillis(
            hour = 19,
            minute = 30,
            now = now
        )
        val scheduled = ZonedDateTime.ofInstant(Instant.ofEpochMilli(triggerMillis), vilniusZone)
        assertEquals(2026, scheduled.year)
        assertEquals(10, scheduled.monthValue)
        assertEquals(24, scheduled.dayOfMonth)
        assertEquals(19, scheduled.hour)
        assertEquals(30, scheduled.minute)
    }

    @Test
    fun \`daily reminder rolls over to tomorrow when target local time has already passed\`() {
        val kyivZone = ZoneId.of("Europe/Kyiv")
        val now = ZonedDateTime.of(2026, 10, 24, 20, 0, 0, 0, kyivZone)

        val triggerMillis = DailyReminderScheduler.computeNextTriggerEpochMillis(
            hour = 19,
            minute = 0,
            now = now
        )
        val scheduled = ZonedDateTime.ofInstant(Instant.ofEpochMilli(triggerMillis), kyivZone)
        assertEquals(25, scheduled.dayOfMonth)
        assertEquals(19, scheduled.hour)
        assertEquals(0, scheduled.minute)
    }
}`,
  },
];
