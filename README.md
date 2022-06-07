# EasyLocker Api

### Quick start

1. Create an `.env` in the root folder with those environment variables (change them if necessary):

```dotenv
DB_URL=mongodb://admin:admin@localhost/easy_locker?authSource=admin&retryWrites=true&w=majority
PORT=4000
SUPER_SECRET='EasyLockerSuperSecret2022'
```

2. Create database `easy_locker`.