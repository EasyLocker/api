const express = require('express');
const router = express.Router();
const Locker = require('../db_models/Locker');
const User = require('../db_models/User');


function handleError(res, msg = null) {
    if (!msg) msg = "C'è stato un errore inaspettato. Stiamo lavorando per risolvere il problema.";
    res.status(msg ? 400 : 500);
    res.json({message: msg});
}

function fieldIsEmpty(field, msgString, res) {
    if (!field) {
        handleError(res, msgString);
        res.status(400);
        res.json({message: msgString});
        return true;
    }

    return false;
}

function checks({name, latitude, longitude, width, height, depth}, res) {
    return fieldIsEmpty(name, 'Missing name', res)
        || fieldIsEmpty(latitude, 'Missing latitude', res)
        || fieldIsEmpty(longitude, 'Missing longitude', res)
        || fieldIsEmpty(width, 'Missing width', res)
        || fieldIsEmpty(height, 'Missing height', res)
        || fieldIsEmpty(depth, 'Missing depth', res);
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
    try {
        if (checks(req.body, res)) return;

        const {
            name,
            latitude,
            longitude,
            width,
            height,
            depth
        } = req.body;

        const locker = new Locker({name, latitude, longitude, width, height, depth});

        locker.save();
        res.send();
    } catch (e) {
        handleError(res);
    }
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
 *     summary: Search an available locker (only available lockers are returned, booked ones are skipped).
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
        {name: {$regex: regex}, userId: {$ne: req.loggedUser.id}}
    )

    res.json(mapLockersToDto(lockers, true));
});

/**
 * @openapi
 * /api/v1/lockers/booked:
 *   get:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Get all locker booked by logged user.
 */
router.get('/booked', async (req, res, next) => {
    let lockers = await Locker.find(
        {userId: {$eq: req.loggedUser.id}}
    )

    res.json(mapLockersToDto(lockers));
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
        handleError(res, 'Missing Locker id');
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

    if (fieldIsEmpty(locker.modifiedCount, 'Locker does not exists', res)) return;

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
    if (fieldIsEmpty(req.body.id, 'Missing Locker id', res)) return;

    let locker = await Locker.findOne({_id: req.body.id}).exec();

    let del = await Locker.deleteOne(locker);

    if (fieldIsEmpty(del.deletedCount, 'Locker does not exists', res)) return;

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
 *     summary: Book a locker by id for logged user
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *
 */
router.patch('/book', async (req, res, next) => {
    const {id} = req.body;

    if (!id) {
        handleError(res, 'Missing Locker id');
        return;
    }

    let locker;
    try {
        locker = await Locker.findOne({_id: id});
    } catch {
    }
    if (fieldIsEmpty(locker, 'Locker does not exists', res)) return;

    locker.userId = req.loggedUser.id;
    locker.save();

    res.sendStatus(200);
});

/**
 * @openapi
 * /api/v1/lockers/cancel:
 *   patch:
 *     responses:
 *       '200':
 *         description: 'OK'
 *     tags:
 *     - Lockers
 *     summary: Cancel the booking of the locker for logged user
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *
 */
router.patch('/cancel', async (req, res, next) => {
    try {
        const {id} = req.body;

        if (!id) {
            handleError(res, 'Missing Locker id');
            return;
        }

        let locker;
        locker = await Locker.findOne({_id: id, userId: req.loggedUser.id});

        if (!locker) {
            handleError(res, 'Could not find the locker')
            return;
        }

        locker.userId = undefined;
        locker.save();

        res.send();

    } catch {
        handleError(res);
    }
});


function mapLockersToDto(lockers, addNotAvailable = false) {
    return lockers.map(l => {
            const res = {
                id: l._id,
                name: l.name,
                latitude: l.latitude,
                longitude: l.longitude,
                width: l.width,
                height: l.height,
                depth: l.depth,
            }

            if (addNotAvailable) {
                res.notAvailable = l.userId !== undefined && l.userId !== req.loggedUser.id;
            }

            return res;
        }
    )
}


module.exports = router;
