const app = require('../app');

const supertest = require('supertest');
const request = supertest(app);

const Locker = require('../db_models/Locker');
const User = require('../db_models/User');
const mongoose = require('mongoose');
const {connectDB, disconnectDB} = require('../config/lockers_test_database');

const bcrypt = require("bcrypt");


let token;
let lockerGetPutDelete;
let lockerToBook;
let lockerToCancel;

describe('Route api/v1/lockers', () => {

    beforeAll(async () => {
        await connectDB();

        let user = new User({
            email: 'correct@email.it',
            password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
        });


        user.save();

        const login = await request.post('/api/v1/authenticate')
            .send({
                email: 'correct@email.it',
                password: 'correctPassword'
            });

        token = login.body.token;

        lockerGetPutDelete = new Locker(
            {
                userId: user.id,
                name: 'testLockerGetPut',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1,
                notAvailable: false,
            });

        lockerGetPutDelete.save();

        lockerToBook = new Locker(
            {
                name: 'testLockerToBook',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1,
                notAvailable: false,
            });

        lockerToBook.save();

        lockerToCancel = new Locker(
            {
                userId: user.id,
                name: 'testLockerToUnbook',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1,
                notAvailable: false,
            });

        lockerToCancel.save();
    });


    afterAll(async () => {
        disconnectDB();
    });

    it('Should respond with the lockers in the database', async () => {
        let res = await request.get('/api/v1/lockers').set('Authorization', 'Bearer ' + token);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    it('Should respond only with the lockers booked by us', async () => {
        let res = await request.get('/api/v1/lockers/booked').set('Authorization', 'Bearer ' + token);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    it('Should create a legitimate locker', async () => {
        let res = await request.post('/api/v1/lockers').set('Authorization', 'Bearer ' + token)
            .send({
                name: 'testLockerPost',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1
            })

        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
        expect(typeof res.body).toBe(typeof {});

    })


    it('Should modify a locker', async () => {
        let res = await request.put('/api/v1/lockers').set('Authorization', 'Bearer ' + token)
            .send({
                id: lockerGetPutDelete.id,
                name: 'testLockerGetPutDelete2',
                latitude: 2,
                longitude: 1,
                width: 1,
                height: 2,
                depth: 1
            })

        // console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
        expect(typeof res.body).toBe(typeof {});
    })

    it('Should delete a locker', async () => {

        let res = await request.delete('/api/v1/lockers').set('Authorization', 'Bearer ' + token)
            .send({
                id: lockerGetPutDelete.id
            })

        expect(res.status).toBe(200);

    })

    it('Should book a locker', async () => {
        let res = await request.patch('/api/v1/lockers/book').set('Authorization', 'Bearer ' + token)
            .send({
                id: lockerToBook.id
            })

        expect(res.status).toBe(200);

    })

    it('Should cancel a locker booking', async () => {

        let res = await request.patch('/api/v1/lockers/cancel').set('Authorization', 'Bearer ' + token)
            .send({
                id: lockerToCancel.id
            })

        expect(res.status).toBe(200);

    })
});