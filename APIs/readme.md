## Intelligence on the APIs

APIs are governed by API Gateway. What is needed is the IdToken from Cognito. The sample user from the TourneyMaster Cognito User Pool is:

username = api_demo@tourneymaster.org
pword = ThisisNotMyRealPasswordJohnok?

### AWS COGNITO

Once a user is created in Cognito it needs to be confirmed. The following two CLI commands will confirm:

```` aws cognito-idp admin-initiate-auth --user-pool-id us-east-1_KCFCcxsf4 --client-id 4e6uq8b4f1f4q5ql8qe10cqfdc --auth-flow ADMIN_NO_SRP_AUTH --auth-parameters USERNAME=<user name>,PASSWORD=<password>````


The above command returns a session token that needs to be cut/paste into the next command to confirm:

````aws cognito-idp admin-respond-to-auth-challenge --user-pool-id us-east-1_KCFCcxsf4 --client-id 4e6uq8b4f1f4q5ql8qe10cqfdc --challenge-name NEW_PASSWORD_REQUIRED --challenge-responses NEW_PASSWORD=<password>,USERNAME=<user name> --session "<session token>"````

After the above command one might need to "NEW_PASSWORD_REQUIRED", so use the following CLI syntax by replacing within the "%"s with your variables
````aws cognito-idp admin-respond-to-auth-challenge --user-pool-id %USER POOL ID% --client-id %CLIENT ID% --challenge-name NEW_PASSWORD_REQUIRED --challenge-responses NEW_PASSWORD=%DESIRED PASSWORD%,USERNAME=%USERS USERNAME% --session %SESSION KEY FROM PREVIOUS COMMAND with ""%````

For Example
````aws2 cognito-idp admin-respond-to-auth-challenge --user-pool-id us-east-1_KCFCcxsf4 --client-id 4e6uq8b4f1f4q5ql8qe10cqfdc --challenge-name NEW_PASSWORD_REQUIRED --challenge-responses NEW_PASSWORD=%password%,USERNAME=kovalov.oleksandr@binary-studio.com --session "<session token from above step in between quotes>"````

There doesn't appear any way to delete a Cognito user using the Console. The following CLI command can do this:

````aws cognito-idp admin-delete-user --user-pool-id us-east-1_KCFCcxsf4 --username <user name>````

To generate authentication tokens via CLI (the IdToken is good for 1 hour):

````aws2 cognito-idp admin-initiate-auth --user-pool-id us-east-1_KCFCcxsf4 --client-id 4e6uq8b4f1f4q5ql8qe10cqfdc --auth-flow ADMIN_USER_PASSWORD_AUTH --auth-parameters USERNAME=api_demo@tourneymaster.org,PASSWORD=ThisisNotMyRealPasswordJohnok?````

### Insomnia (or Apigee, Kong, etc.) to test APIs
To utilize the APIs, users need an IDToken to do CRUD operations on the database using the API.
<img src="https://miscellaneous312.s3.amazonaws.com/CLI+to+get+IDToken.png"
     alt="CLI Token"
     style="float: left; margin-right: 10px;" />

Then, once the IDToken is obtained, the below screenshot shows an example of how to structure an API call. One could also utilize a CURL command just as easily.
<img src="https://miscellaneous312.s3.amazonaws.com/Sample+Insomnia+call+to+GET+event_master+API.png"
     alt="Sample Call"
     style="float: left; margin-right: 10px;" />
____

### API GATEWAY
### To list every endpoint along with their optional passed parameter, we can use this API
` https://api.tourneymaster.org/v2/reference`
Be sure to include your IDToken, as it goes via the gateway

Notes:
* All access to APIs requires an AccessId token to be passed in as an Authorization header (see above)
* If you try to POST a field that doesn't exist in the table an error will be thrown
* Test data is provided below. It was valid when tested (Feb, 2020). Test data will need to be changed to reflect any changes in schema.
* All GET Lambdas were written in Node, which outputs clean JSON. Python's JSON.dumps command produced "messy" JSON that couldn't be easily consumed by other Javascript apps
* There are still a few DELETE Lambdas written in Python

#### Divisions (events.divisions)
1. GET (all): https://api.tourneymaster.org/v2/divisions
1. GET (specific division): https://api.tourneymaster.org/v2/divisions?division_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/events?event_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/events?event_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/divisions
1. TEST POST DATA: {"division_id": "99", "event_id": "ABC123", "long_name": "LONG NAME", "short_name": "SHORT NAME", "is_premier_YN": 0, "entry_fee": 9.99, "division_description": "divdesc", "division_tag": "TAG", "max_num_teams": 20, "teams_registered": 10, "teams_tentitive": 12, "num_pools": 2, "division_message": "message", "division_sort": 0, "latest_web_publish": "2020-01-01 12:00:00", "is_active_YN": 1, "is_library_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Events (events.event_master)
1. GET (all): https://api.tourneymaster.org/v2/events
1. GET (specific event): https://api.tourneymaster.org/v2/events?event_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/events?event_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/events?event_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/events?event_id/events
1. TEST POST DATA: {"event_id": "ABC444", "sport_id": "1", "org_id": "ABC PROD CO", "event_name": "MEDIUM EVENT", "event_description": "Description", "event_startdate": "2020-01-01", "event_enddate": "2020-01-01", "time_zone_utc": 0, "event_format_id": 0, "first_game_time": "08:00:00", "last_game_end": "10:10:10", "primary_location_desc": "Location", "num_of_locations": 1, "period_duration": "30:00", "periods_per_game": 4, "exclusive_time_ranges_YN": 0, "tie_breaker_format_id": 0, "min_num_of_games": 0, "max_num_of_divisions": 0, "max_num_teams_per_division": 99, "assoc_docs_URL": "url", "division_id": 0, "event_logo_path": "logopath", "is_active_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00","updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Facilities (events.facilities)
1. GET (all): https://api.tourneymaster.org/v2/facilities
1. GET (specific facility): https://api.tourneymaster.org/v2/facilities?facilities_id=[NUMBER]
1. DELETE: https://api.tourneymaster.org/v2/facilities?facilities_id=[NUMBER]
1. POST: https://api.tourneymaster.org/v2/facilities?facilities_id=[NUMBER]
1. POST: https://api.tourneymaster.org/v2/facilities
1. TEST POST DATA: {"facilities_id": 23, "event_id": "ABC123", "facilities_description": "BIG AZURE FIELD", "num_fields": 99, "facilities_tag": "TAG", "address1": "123 Main St.", "address2": "", "city": "New Orleans", "zip": "70000", "country": "US", "facility_lat": 30.0, "facility_lon": -90.0, "facility_sort": 0, "is_active_YN": 0, "in_library_YN": 0, "public_access_YN": 0, "restrooms": "RR", "num_toilets": 1, "restroom_details": "details", "parking_available": "pkg", "parking_details": "details", "parking_proximity": "proximity", "golf_carts_available": "Y", "field_map_URL": "url", "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Fields (events.fields)
1. GET (all): https://api.tourneymaster.org/v1/fields
1. GET (specific field): https://api.tourneymaster.org/v2/fields?fields_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/fields?fields_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/fields?fields_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/fields
1. TEST POST DATA: {"field_id": "ABC123", "facilities_id": "1", "field_name": "MAIN", "field_abbreviation": "M", "field_opentime": "10:00:00", "field_closetime": "22:00:00", "field_notes": "Notes", "field_sort": 0, "is_active_YN": 1, "is_library_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Games (events.games)
1. GET (all): https://api.tourneymaster.org/v1/games
1. GET (specific game): https://api.tourneymaster.org/v2/games?game_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/games?game_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/games?game_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/games
1. TEST POST DATA: {"game_id": "GM99","event_id": "ABC123","schedule_id": "SCD001","sport_id": 1,"facilities_id": 1,"field_id": "ABC122","game_date": "1-1-2020"}


#### Members (events.members)
1. GET (all): https://api.tourneymaster.org/v2/members
1. GET (specific member): https://api.tourneymaster.org/v2/members?member_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/members?member_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/members?member_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/members
1. TEST POST DATA: {"member_id": "ABC123", "first_name": "Joe", "last_name": "Smith", "member_tag": "TAG", "is_active_YN": 1, "email_address": "joe@someemail.xyz", "cognito_sub": "ABC", "access_token_ios": "IOS AT", "access_token_android": "ANDROID AT", "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Orgs (events.organizations)
1. GET (all): https://api.tourneymaster.org/v1/orgs
1. GET (specific organization): https://api.tourneymaster.org/v1/orgs?org_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v1/orgs?org_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v1/orgs?org_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v1/orgs
1. TEST POST DATA:   {"org_id": "ORG123","org_name": "CIVITAN","org_tag": "TAG","city": "Philadelphia","state": "PA","is_active_YN": 1, "created_by": "SF7654AA","created_datetime": "2020-01-01 12:00:00"}


#### Registrations (events.registrations)
1. GET (all): https://api.tourneymaster.org/v2/registrations
1. GET (specific registration): https://api.tourneymaster.org/v2/registrations?registration_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v2/registrations?registration_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v2/registrations?registration_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v2/registrations
1. TEST POST DATA:  {"registration_id": "REG123","event_id": "ABC123","entry_fee": 99.99,"entry_deposit": 33.33,"registration_start": "2020-01-01 12:00:00","registration_end": "2020-01-01 12:00:00","entry_name_label": "label","division_name_label": "label","division_name_requested_YN": 0,"division_name_required_YN": 0,"contact1_label": "AAA","contact1_name_requested_YN": 0,"contact1_name_required_YN": 0,"contact2_label": "BBB","contact2_name_requested_YN": 0,"contact2_name_required_YN": 0,"contact3_label": "CCC","contact3_name_requested_YN": 0,"contact3_name_required_YN": 0,"max_teams_per_division": 30,"min_players_per_roster": 10,"max_players_per_roster": 20,"request_athlete_birthdate": 0,"request_athlete_jersey_number": 0,"request_athlete_email": 0,"disclaimer": "XYZ","registration_information": "INFO","is_active_YN": 0,"is_library_YN": 1,"created_by": "ABC","created_datetime": "2020-01-01 12:00:00","updated_by": "ABC","updated_datetime": "2020-01-01 12:00:00"}


#### Requests (events.requests)
1. GET (all): https://api.tourneymaster.org/v2/requests
1. GET (specific request): https://api.tourneymaster.org/v1/requests?request_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v1/requestss?request_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v1/requestss?request_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v1/requests
1. TEST POST DATA:    {"request_id": "REQ123","event_id": "ABC123","member_id": "SF7654AA","request_type": "ASDF","request_description": "request","assigned_to": "ABC","follow_up_date": "2020-01-01 12:00:00","relates_to": "ZZZ","request_tag1": "RT1","is_active_YN": 0,"is_library_YN": 1,"created_by": "SF7654AA","created_datetime": "2020-01-01 12:00:00","updated_by": "SF7654AA","updated_datetime": "2020-01-01 12:00:00"}


#### Schedules (events.schedules)
1. GET (all): https://api.tourneymaster.org/v1/schedules
1. GET (specific schedule): https://api.tourneymaster.org/v1/schedules?schedule_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v1/schedules?schedule_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v1/schedules?schedule_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v1/schedules
1. TEST POST DATA:  {"schedule_id": "SCD001", "event_id": "ABC123", "member_id": "4DC8A780", "num_divisions": 5, "num_teams": 24, "schedule_status": "STATUS", "last_web_publish": "2020-01-01 12:00:00", "is_active_YN": 1, "is_library_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}


#### Sports (events.sports)
1. GET (all): https://api.tourneymaster.org/v1/sports
1. GET (specific sport): https://api.tourneymaster.org/v1/sports?sport_id=[NUMBER]
1. DELETE: https://api.tourneymaster.org/v1/sports?sport_id=[NUMBER]
1. PUT: https://api.tourneymaster.org/v1/sports?sport_id=[NUMBER]
1. POST: https://api.tourneymaster.org/v1/sports
1. TEST POST DATA: {"sport_id": 99, "sport_description": "Kickball", "is_active_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780","updated_datetime": "2020-01-01 12:00:00"}


#### Teams (events.teams)
1. GET (all): https://api.tourneymaster.org/v1/teams
1. GET (specific team): https://api.tourneymaster.org/v1/teams?team_id=[VARCHAR]
1. DELETE: https://api.tourneymaster.org/v1/teams?team_id=[VARCHAR]
1. PUT: https://api.tourneymaster.org/v1/teams?team_id=[VARCHAR]
1. POST: https://api.tourneymaster.org/v1/teams
1. TEST POST DATA: {"team_id": "TEAM3", "event_id": "ABC123", "org_id": "1", "long_name": "LONG NAME", "short_name": "SHORT NAME", "team_tag": "TAG", "city": "City", "state": "ST", "level": "L", "contact_first_name": "Joe", "contact_last_name": "Smith", "phone_num": "123-123-1234",
"contact_email": "joe@someemail.xyz", "schedule_restrictions": 0, "is_active_YN": 1, "is_library_YN": 0, "created_by": "4DC8A780", "created_datetime": "2020-01-01 12:00:00", "updated_by": "4DC8A780", "updated_datetime": "2020-01-01 12:00:00"}
