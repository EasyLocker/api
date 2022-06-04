const request = require('supertest');
const app = require('../app');
const User = require("../db_models/User");
const bcrypt = require("bcrypt");

describe('Route /api/v1/users', () => {
    const mocks = [];
    let saved = false;

    beforeAll(() => {
        const User = require('../db_models/User');
        mocks.push(jest.spyOn(User, 'exists').mockImplementation(async (filter) => {
                const dbEntry = {
                    _id: '5c9f8f8f8f8f8f8f8f8f8f8',
                    email: 'existing@email.it',
                    password: await bcrypt.hash('correctPassword', 10), // 10 = salt rounds
                };

                Object.keys(filter).forEach(key => {
                    if (filter[key] !== dbEntry[key]) {
                        return true;
                    }
                });

                return false;
            }
        ));
        mocks.push(jest.spyOn(User.prototype, 'save').mockImplementation(async () => {
                saved = true;
            }
        ));
    });

    afterAll(async () => {
        mocks.forEach(mock => mock.mockRestore());
    });

    it('should create a user and return a token', async () => {
        await request(app)
            .post('/api/v1/users/register')
            .send({
                name: 'John',
                surname: 'Doe',
                email: 'jhon@doe.com',
                password: 'correctPassword',
            })
            .expect(200)
            .expect(res => {
                expect(res.body.token).toBeDefined();
                expect(saved).toBe(true);
            });
    });
});
