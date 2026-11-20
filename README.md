# Batwa (Android, Capacitor)

Offline daily expense, income and loan tracker. Data lives on the device (localStorage).
The daily reminder uses native Android notifications, so it fires even when the app is closed.

## Prerequisites
- Node.js 20 or newer
- Android Studio (latest) with an Android SDK and JDK 21 (bundled with Android Studio)

## Build
```bash
npm run setup        # npm install, add android platform, generate icons/splash, sync
npm run open         # opens the project in Android Studio
```
In Android Studio: wait for Gradle sync, then Run (emulator or USB phone), or
Build > Build Bundle(s) / APK(s) > Build APK(s).

Or from the command line: `cd android && ./gradlew assembleDebug`
(APK appears in `android/app/build/outputs/apk/debug/`).

After editing anything in `www/`, run `npm run sync` and rebuild.

## Reminder notes
- Android 13+ asks for notification permission the first time you save a reminder.
- Batwa keeps one repeating daily notification (id 1). Changing the time reschedules it.
- Some phone makers (Xiaomi, Oppo, Vivo, Samsung) restrict background apps. If reminders
  are late or missing, set Batwa to "Unrestricted" battery use and allow auto-start.
- Optional: for exact-time delivery on Android 12+, enable "Alarms & reminders" for Batwa
  in system settings.

## Release build
Create a keystore, then Android Studio > Build > Generate Signed Bundle / APK.
Change `appId` in `capacitor.config.json` (and re-run `cap add android` on a fresh clone)
before publishing to the Play Store; it cannot change after release.

## Layout
```
www/index.html        app shell
www/css/style.css     styles (light/dark)
www/js/app.js         all app logic
assets/               icon + splash sources for @capacitor/assets
capacitor.config.json app id, name, notification settings
```
