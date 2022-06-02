const express = require('express');
const Locker = require('../db_models/Locker');
const User = require('../db_models/User');
const router = express.Router();

function checkField(field, msgString, res) {
    if (!field) {
        res.status(400);
        res.json({message: msgString});
        return true;
    }

    return false;
}

function checks({name, latitude, longitude, width, height, depth}, res) {
    if (checkField(name, 'Missing name', res)) return false;
    if (checkField(latitude, 'Missing latitude', res)) return false;
    if (checkField(longitude, 'Missing longitude', res)) return false;
    if (checkField(width, 'Missing width', res)) return false;
    if (checkField(height, 'Missing height', res)) return false;
    if (checkField(depth, 'Missing depth', res)) return false;


    return true;
}

/**
 * @openapi
 * /api/v1/lockers:
 *   post:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Register a new locker
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *               depth:
 *                 type: number
 *               userId:
 *                 type: string
 *
 */
router.post('/', async (req, res, next) => {
    if (!checks(req.body, res)) {
        return;
    }

    const {
        name,
        latitude,
        longitude,
        width,
        height,
        depth
    } = req.body;

    //console.log(req.body);
    const locker = new Locker({name, latitude, longitude, width, height, depth});

    locker.save();
    res.send();
});

/**
 * @openapi
 * /api/v1/lockers:
 *   get:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Search a locker
 *     parameters:
 *         - in: query
 *           name: name
 *           schema:
 *             type: string
 *           required: false
 *           description: Name of the locker the user is looking for
 */
router.get('/', async (req, res, next) => {
    const regex = new RegExp(req.query.name, 'i')
    let lockers = await Locker.find(
        {name: {$regex: regex}}
    )

    const response = lockers.map(l => ({
            id: l._id,
            name: l.name,
            latitude: l.latitude,
            longitude: l.longitude,
            width: l.width,
            height: l.height,
            depth: l.depth,
            bookedByMe: false,//l.userId === req.loggedUser.id,
            bookedByOthers: false//l.userId && l.userId !== req.loggedUser.id,
        })
    )

    res.json(response);
});

/**
 * @openapi
 * /api/v1/lockers:
 *   put:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Modify a locker
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               width:
 *                 type: number
 *               height:
 *                 type: number
 *               depth:
 *                 type: number
 *               userId:
 *                 type: string
 *
 */
router.put('/', async (req, res, next) => {

    if (!checks(req.body, res)) {
        return;
    }

    if (!req.body.id) {
        res.status(400);
        res.json({message: 'Missing id'});
        return;
    }

    const {
        id,
        name,
        latitude,
        longitude,
        width,
        height,
        depth
    } = req.body;

    let locker = await Locker.replaceOne({_id: id}, {name, latitude, longitude, width, height, depth});

    if (!locker.modifiedCount) {
        res.status(400);
        res.json({message: 'Locker does not exists'});
        return;
    }

    res.json(locker);
});

/**
 * @openapi
 * /api/v1/lockers:
 *   delete:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Delete a locker
 *     parameters:
 *         - in: query
 *           name: id
 *           schema:
 *             type: string
 *           required: true
 *           description: Id of the locker which has to be deleted
 */
router.delete('/', async (req, res, next) => {
    if (!req.body.id) {
        res.status(400);
        res.json({message: 'Missing id'});
        return;
    }

    let locker = await Locker.findOne({_id: req.body.id}).exec();

    let del = await Locker.deleteOne(locker);

    if (!del.deletedCount) {
        res.status(400);
        res.json({message: 'Locker does not exists'});
        return;
    }

    res.sendStatus(200);
});

/**
 * @openapi
 * /api/v1/lockers/book:
 *   patch:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Modify the user that has booked the locker
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               userId:
 *                 type: string
 *
 */
router.patch('/book', async (req, res, next) => {
    if (!req.body.id) {
        res.status(400);
        res.json({message: 'Missing Locker id'});
        return;
    }

    if (!req.body.userId) {
        res.status(400);
        res.json({message: 'Missing userId'});
        return;
    }

    const {
        id,
        userId
    } = req.body;


    let locker;
    try {
        locker = await Locker.findOne({_id: id});
    } catch {
        res.status(400);
        res.json({message: 'Could not find the locker'});
        return;
    }

    let user;
    try {
        user = await User.findOne({_id: userId});
    } catch {
        res.status(400);
        res.json({message: 'User does not exists'});
        return;
    }

    locker.userId = userId;
    locker.save();

    res.send();

});

router.patch('/unbook', async (req, res, next) => {
    if (!req.body.id) {
        res.status(400);
        res.json({message: 'Missing Locker id'});
        return;
    }

    const {
        id
    } = req.body;


    let locker;
    try {
        locker = await Locker.findOne({_id: id});
    } catch {
        res.status(400);
        res.json({message: 'Could not find the locker'});
        return;
    }


    locker.userId = "";
    locker.save();

    res.send();

});
module.exports = router;