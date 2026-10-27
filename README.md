# STATOR Gathering

The interface uses React from its browser CDN, and a small Java HTTP server serves the page and event-information API.

## Requirements

- JDK 17 or newer
- Internet access to load React, Tailwind CSS, and Font Awesome from their CDNs

## Run locally

From the project root, run:

```powershell
java backend\EventServer.java
```

Then open [http://localhost:8080](http://localhost:8080). The server binds to the local machine only. To use a different port and web root, pass them as arguments, for example:

```powershell
java backend\EventServer.java 8081 .
```

The event details and room/group unlock date are returned by `GET /api/event`.
