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

        let userAdmin = new User({
            email: 'admin@email.it',
            password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
            role: 'Admin'
        });
        userAdmin.save();

        let userNotAdmin = new User({
            email: 'user@email.it',
            password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
            role: 'User'
        });

        userNotAdmin.save();


        const userLogin = await request.post('/api/v1/authenticate')
            .send({
                email: 'user@email.it',
                password: 'correctPassword'
            });

        userToken = userLogin.body.token;

        const adminLogin = await request.post('/api/v1/authenticate')
            .send({
                email: 'admin@email.it',
                password: 'correctPassword'
            });

        adminToken = adminLogin.body.token;

        lockerGetPutDelete = new Locker(
            {
                userId: userNotAdmin.id,
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
                userId: userNotAdmin.id,
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

    it('Should deny the request', async () => {
        let res = await request.get('/api/v1/lockers').set('Authorization', 'Bearer ' + userToken);
        expect(403);
    });

    it('Should respond with a list of all the lockers', async () => {
        let res = await request.get('/api/v1/lockers').set('Authorization', 'Bearer ' + adminToken);
        expect(200);
    });

    it('Should respond with the available lockers in the database', async () => {
        let res = await request.get('/api/v1/lockers/available').set('Authorization', 'Bearer ' + userToken);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    it('Should respond only with the lockers booked by us', async () => {
        let res = await request.get('/api/v1/lockers/booked').set('Authorization', 'Bearer ' + userToken);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    it('Should create a legitimate locker', async () => {
        let res = await request.post('/api/v1/lockers').set('Authorization', 'Bearer ' + adminToken)
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

    it('Should deny the creation of the locker', async () => {
        let res = await request.post('/api/v1/lockers').set('Authorization', 'Bearer ' + userToken)
            .send({
                name: 'testLockerPost',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1
            })

        expect(res.status).toBe(403);
        expect(res.body).toBeDefined();
        expect(typeof res.body).toBe(typeof {});

    })

    it('Should modify a locker', async () => {
        let res = await request.put('/api/v1/lockers/' + lockerGetPutDelete.id).set('Authorization', 'Bearer ' + adminToken)
            .send({
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

    it('Should deny the modification of the locker', async () => {
        let res = await request.put('/api/v1/lockers/' + lockerGetPutDelete.id).set('Authorization', 'Bearer ' + userToken)
            .send({
                name: 'testLockerGetPutDelete2',
                latitude: 2,
                longitude: 1,
                width: 1,
                height: 2,
                depth: 1
            })

        // console.log(res.body);
        expect(res.status).toBe(403);
        expect(res.body).toBeDefined();
        expect(typeof res.body).toBe(typeof {});
    })

    it('Should delete a locker', async () => {
        let res = await request.delete('/api/v1/lockers/' + lockerGetPutDelete.id).set('Authorization', 'Bearer ' + adminToken);
        expect(res.status).toBe(200);
    })

    it('Should deny the cancellation of the locker', async () => {
        let res = await request.delete('/api/v1/lockers/' + lockerGetPutDelete.id).set('Authorization', 'Bearer ' + userToken);
        expect(res.status).toBe(403);
    })

    it('Should book a locker', async () => {
        let res = await request.patch('/api/v1/lockers/book').set('Authorization', 'Bearer ' + userToken)
            .send({
                id: lockerToBook.id
            })

        expect(res.status).toBe(200);

    })

    it('Should cancel a locker booking', async () => {

        let res = await request.patch('/api/v1/lockers/cancel').set('Authorization', 'Bearer ' + userToken)
            .send({
                id: lockerToCancel.id
            })

        expect(res.status).toBe(200);

    })
});