# moderator requirements

- OTHER
    - [ ] make moderators' remove report button
    - [ ] use inputField by fahi

- REPORT PAGE
    - [X] view all submited reports
    - [X] filter and sort reports by category, date, status and severity
    - [ ] mark reports as “Under Review”, “Resolved – No Action” or “Action Taken”
    - [ ] allow changing status of reports
    - [ ] enforce that at most one moderator is actively reviewing a report
        - [ ] add moderator assigned field
    - [X] display categories and filter by
    - [X] display severity and filter by

database changes:
- report: assignedModeratorId, severity (enum - low, medium, high), category (FAKE_INFORMATION, IMPERSONATION, INAPPROPRIATE_BEHAVIOUR, OTHER)

- USER LIST
    - [X] each user has 2 buttons: ban / add offence / issue warning
    - [X] if banned/offenced/warned send auto email
    - [X] if banned automatically remove associated listings and withdraw all related property applications

- REVIEWS
    - [ ] remove reviews
    - [X] retain record of removed reviews