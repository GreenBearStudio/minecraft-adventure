# minecraft-adventure

Uses Next.js and MDX to build a website. Also compiles to Android.

## ✅ Outcome

- Every run produces signed .apk and .aab artifacts.
- They’re immediately ready for upload to Google Play and Amazon Appstore.
- No manual signing in Android Studio required.

## Android Dev

### Generate key

`keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias storyboardKey`

It is located in `${HOME}\secure`

### 🔑 How to test which password works
You can use the keytool -list command to check:

`keytool -list -v -keystore my-release-key.jks -alias storyboardKey`

- It will first ask for the keystore password.
- If you set a different key password, it will then prompt for that.
- If you didn’t, the keystore password will also unlock the alias.

## Uploading Images / Videos
In `files`, go to `images` or `videos`, each has a `sync` script,
running that will upload files in `todo`, append to txt file and move
local copy to `uploaded` folder.

Need to activate venv python environment. Run `bash ./setup.bash` to
create the `.venv` python3 virtual environment.

_NOTE_ activating a virtual environment in script will deactivate it
once the script is done.

