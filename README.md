Display desktop notifications for login and suspended tickets in Kayako.

## Problem

Kayako does not provide notifications for suspended emails.
Where I work, suspended emails only happen occasionally and most, such as automatic vacation replies, can be disregarded and deleted.
However, occasionally, one will deserve a timely response.
Because of how they show up in the interface, noticing these requires manual attention.

Additionally, since I have Kayako in a pinned tab, if it is logged out, I might not notice.
If logged out, the script cannot check for suspended messages.

## Solution

This script first checks if the user is at the login screen.
If the login screen is detected, it will occasionally raise a notification to login.
This enables the pinned tab to be easily foregrounded so that Kayako may be logged into.

When logged in, the script checks for suspended messages every 5 minutes.
If a suspended message is found, a notification is raised.

[Install](binki-kayako-suspended-notifier.user.js?raw=1)
