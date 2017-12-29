# Nativescript Twilio Video Plugin

1 to 1 video chat working on iOS and Android.

## How does it work?
Twilio has to verify a user before they can join a room. Simply use the user id to receive a token and select a room for them to join.

## Steps

# 1
Make an account on twilio.com

# 2
Create a Programmable Video application. You'll receive an api key, auth token, and account sid. Shouldn't have to tell you but don't share them!

# 3 
This will require minimum server knowledge. I used node. You can find further instructions here https://www.twilio.com/docs/api/video/identity also here https://github.com/TwilioDevEd/video-access-token-server-node

# 4
In AndroidManifest.xml
```
<uses-permission android:name="android.permission.CAMERA" />

<uses-permission android:name="android.permission.RECORD_AUDIO" />	
```
In Info.plist
```
<key>NSCameraUsageDescription</key>
<string>${PRODUCT_NAME} my super cool reason</string>
<key>NSMicrophoneUsageDescription</key>
<string>${PRODUCT_NAME} my other cool reason</string>
```
# 5
Once you have your server configured, change the url to match yours. You may also need to change the key on the object you're sending. It's currently { uid: name }.

# 6
Enjoy!!!

![Alt text](./cool1.png?raw=true "Title")

# Extras
You will notice in the code I'm explicitly asking camera and mic permissions for iOS. Yea you don't need that bit of code. You can erase that and it'll work just fine. In my case I needed to get those permissions a little bit earlier. So I left them incase someone else needed them. ;)