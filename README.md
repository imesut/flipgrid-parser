# Flipgrid Parser API

Fetches All of the responses data from Flipgrid for dashboarding purposes and data analysis.

This project is using Flipgrid's current APIs which serves contents to their admin pages.

## Running API Locally

Just run ```npm install``` for configuration and satisfying requirements. Then ```npm start``` command will be able to run **flipgrid-parser**. The application will be ready to serve **from port 3000**.


## Request Model

**Request URL:** https://flipgrid-parser.herokuapp.com/getAll

There is two way of authentication;


### 1. Use Bearer token

Use Bearer token obtained from a session from Flipgrid's Admin page.

```javascript
xhr.open("GET", "https://flipgrid-parser.herokuapp.com/getAll");
xhr.setRequestHeader("Authorization", "Bearer <your-bearer-token>");
xhr.send();
```

### 2. Use email and password

Send your admin panel email and password for the script which obtains bearer token with your credentials.

```javascript
xhr.open("GET", "https://flipgrid-parser.herokuapp.com/getAll");
xhr.setRequestHeader("email", "<your-email-here>");
xhr.setRequestHeader("password", "<your-password-here>");
xhr.send();
```

***Note:** Email and password aren't stored.* :relieved:
