const app = require('../app');

const supertest = require('supertest');
const request = supertest(app);

const Locker = require('../db_models/Locker');
const User = require('../db_models/User');
const mongoose = require('mongoose');
const {connectDB, disconnectDB} = require('../config/lockers_test_database');

const bcrypt = require("bcrypt");


let token;

//Mocks
describe('Route api/v1/lockers', () => {
    let lockerSpy;

    beforeAll(async () => {
        await connectDB();

        let user = new User({
            id: '5c9f8f8f8f8f8f8f8f8f8f8',
            email: 'correct@email.it',
            password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
        });


        user.save();
        // console.log(user);
        // user = await User.find({email: 'correct@gmail.it'});
        // console.log(user);

        const login = await request.post('/api/v1/authenticate')
            .send({
                email: 'correct@email.it',
                password: 'correctPassword'
            });

        token = login.body.token;


        let locker2 = new Locker(
            {
                userId: '6290daa478b876fa28581b97',
                name: 'testLocker2',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1,
                notAvailable: false,
            });

        locker2.save();

        // console.log(user.id);
        let locker3 = new Locker(
            {
                userId: user.id,
                name: 'testLocker3',
                latitude: 1,
                longitude: 1,
                width: 1,
                height: 1,
                depth: 1,
                notAvailable: false,
            });

        locker3.save();
    });

    afterAll(async () => {
        // lockerSpy.mockRestore();
        disconnectDB();
        //server.close();
    });

    test('GET /api/v1/lockers should respond with the lockers in the database', async () => {
        let res = await request.get('/api/v1/lockers').set('Authorization', 'Bearer ' + token);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    test('GET /api/v1/lockers/booked should respond with a locker booked by us', async () => {
        let res = await request.get('/api/v1/lockers/booked').set('Authorization', 'Bearer ' + token);
        expect(200);
        expect(typeof res.body).toBe(typeof [{}]);
    });

    test('POST request: Create a legitimate locker', async () => {
        let res = await request.post('/api/v1/lockers').set('Authorization', 'Bearer ' + token)
            .send({
                name: 'testLocker',
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


});