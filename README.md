Softcom Backend API Assessement
==============================================

This API is a sample Stackoverflow Clone.
----------
Docker Image Link
----------
`https://hub.docker.com/r/moriagape/softcom-backend-assessment`

You can pull with
`docker pull moriagape/softcom-backend-assessment`

Clone repository and run npm install to setup dependencies

Create a `.env` file
----------------------------
Add the parameters below (`add your own values`)

**Environment Variables:**
```
PORT=4444
BASE_URL=''
MONGODB_HOST=
MONGODB_USER=
MONGODB_PASSWORD=
MONGODB_DATABASE_NAME=
MONGODB_PORT=
JWTEXPIRESIN='1h'
JWTSECRET=
SENDGRID_API_KEY='Sample API key in sample.env file'
```

Get API running
----------------------------
```
npm start
```
Check For Linting
-------------
```
npm run lint
```
Run Test
-------------
```
npm test
```

## Documentation
Link to hosted swagger doc: https://softcom-backend-assessment.herokuapp.com/api-docs

