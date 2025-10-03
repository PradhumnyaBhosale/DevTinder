
AUTH-Router
-POST/signup
-POST/login
-POST/logout

PROFILE-Router
-GET /profile/view
-PATCH /profile /edit
-PATCH / profile/password

ConnectionRequest-Router
-POST/request/send/interested/:userID
-POST/request/send/ignored/:userID
-POST/request/review/accepted/:requestID
-POST/request/review/rejected/:requestID
-GET/user/connection

FEED-Router
-GET/connections
-GET/request/received
-GET/feed - Gets you the profiles of other users on platform


Status: ignored, intersted, accepted, rejected



