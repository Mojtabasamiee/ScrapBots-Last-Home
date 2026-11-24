#!/bin/bash
# Build the Scrap Bots WebView APK: aapt2 -> "$JAVA_HOME/bin/javac" -> d8 -> package -> zipalign -> apksigner
set -e
SDK=/home/z/android-sdk
BT=$SDK/build-tools/34.0.0
PLAT=$SDK/platforms/android-34/android.jar
PROJ=/home/z/my-project/scrapbots/android
OUT=/tmp/apkbuild
RELEASE=/home/z/my-project/scrapbots/release
KS=/home/z/my-project/scrapbots/keystore/scrapbots-release.keystore

rm -rf $OUT && mkdir -p $OUT/gen $OUT/obj $OUT/dex
mkdir -p $RELEASE

# 1) copy game into assets
mkdir -p $PROJ/app/src/main/assets
cp /home/z/my-project/scrapbots/index.html $PROJ/app/src/main/assets/index.html

# 2) compile resources
$BT/aapt2 compile --dir $PROJ/app/src/main/res -o $OUT/res.zip
$BT/aapt2 link -o $OUT/base.apk -I $PLAT --manifest $PROJ/app/src/main/AndroidManifest.xml \
  -R $OUT/res.zip --java $OUT/gen --auto-add-overlay

# 3) compile java
"$JAVA_HOME/bin/javac" -source 1.8 -target 1.8 -bootclasspath $PLAT -classpath $OUT/gen \
  -d $OUT/obj $(find $PROJ/app/src/main/java -name '*.java')

# 4) dex
$BT/d8 --release --min-api 21 --lib $PLAT --output $OUT/dex $(find $OUT/obj -name '*.class')

# 5) add dex + assets into apk
cd $OUT && cp base.apk unsigned.apk && zip -qj unsigned.apk dex/classes.dex
cd $PROJ/app/src/main/assets && zip -q $OUT/unsigned.apk index.html

# 6) zipalign
$BT/zipalign -f -p 4 $OUT/unsigned.apk $OUT/aligned.apk

# 7) sign
$BT/apksigner sign --ks $KS --ks-pass pass:'ScrapBots2024!Key' \
  --ks-key-alias scrapbots --out $RELEASE/ScrapBots-LastHome-v1.1.apk $OUT/aligned.apk

# verify
$BT/apksigner verify --print-certs $RELEASE/ScrapBots-LastHome-v1.1.apk | head -5
ls -la $RELEASE/
echo "APK BUILD OK"
