#!/bin/bash
# Generate the release keystore for Scrap Bots: Last Home
set -e
KS=/home/z/my-project/scrapbots/keystore/scrapbots-release.keystore
if [ -f "$KS" ]; then echo "keystore exists"; exit 0; fi
keytool -genkeypair -v \
  -keystore "$KS" \
  -alias scrapbots \
  -keyalg RSA -keysize 2048 -validity 10950 \
  -storepass ScrapBots2024!Key -keypass ScrapBots2024!Key \
  -dname "CN=Scrap Bots Last Home, OU=Game, O=ArinWorkshop, L=Tehran, C=IR"
echo "=== keystore generated ==="
keytool -list -keystore "$KS" -storepass ScrapBots2024!Key | head -15
