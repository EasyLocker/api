const request = require('supertest');
const app = require('../app');
const bcrypt = require("bcrypt");

describe('Route /api/v1/authenticate', () => {
    let userFindOneMockSpy;

    beforeAll(() => {
        jest.setTimeout(10000);
        const User = require('../db_models/User');
        userFindOneMockSpy = jest.spyOn(User, 'findOne').mockImplementation((filter) =>
            ({
                exec: async () => {
                    const dbEntry = {
                        _id: '5c9f8f8f8f8f8f8f8f8f8f8',
                        email: 'correct@email.it',
                        password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
                    };

                    let ret = dbEntry;
                    Object.keys(filter).forEach(key => {
                        if (filter[key] !== dbEntry[key]) {
                            ret = null;
                        }
                    });

                    return ret;
                }
            })
        )
    });

    afterAll(async () => {
        userFindOneMockSpy.mockRestore();
    });

    test('Authentication with an existent user should success with 200 error code and token in response', () => {
        return request(app)
            .post('/api/v1/authenticate')
            .send({
                email: 'correct@email.it',
                password: 'correctPassword'
            })
            .expect(200)
            .expect(res => {
                expect(res.body.token).toBeDefined();
            });
    });

    test('Authentication with a non existent user should fail with 400 error code', () => {
        return request(app)
            .post('/api/v1/authenticate')
            .send({
                email: 'wrong@email.it',
                password: 'correctPassword'
            })
            .expect(400);
    });

    test('Authentication with an incorrect password should fail with 400 error code', () => {
        return request(app)
            .post('/api/v1/authenticate')
            .send({
                email: 'correct@email.it',
                password: 'wrongPassword'
            })
            .expect(400);
    });

    test('Authentication with an empty email should fail with 400 error code', () => {
        return request(app)
            .post('/api/v1/authenticate')
            .send({
                email: '',
                password: 'correctPassword'
            })
            .expect(400);
    });

    test('Authentication with an empty password should fail with 400 error code', () => {
        return request(app)
            .post('/api/v1/authenticate')
            .send({
                email: 'correct@email.it',
                password: ''
            })
            .expect(400);
    });
});
