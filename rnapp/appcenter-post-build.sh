
#!/usr/bin/env bash

HOCKEYAPP_API_TOKEN=d71f173637cf40189c41d822aeef4097
HOCKEYAPP_APP_ID=8d746179d46d49e7b3b33b949939d5fc

# Example: Upload master branch app binary to HockeyApp using the API
if [ "$APPCENTER_BRANCH" == "master" ];
then
curl \
-F "status=2" \
-F "ipa=@$APPCENTER_OUTPUT_DIRECTORY/rnapp.ipa" \
-H "X-HockeyAppToken: $HOCKEYAPP_API_TOKEN" \
https://rink.hockeyapp.net/api/2/apps/$HOCKEYAPP_APP_ID/app_versions/upload
else
echo "Current branch is $APPCENTER_BRANCH"
fi
