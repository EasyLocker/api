const express = require('express');
const router = express.Router();
const Locker = require('../db_models/Locker');
const User = require('../db_models/User');


function handleError(res, msg = null) {
    if (!msg) msg = "Unexpected error. We are working to solve the issue. Thanks for your patience.";
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

function checkIfEmpty({name, latitude, longitude, width, height, depth}, res) {
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
 *      '200':
 *        $ref: '#/components/responses/code200'
 *      '400':
 *        $ref: '#/components/responses/code400'
 *      '500':
 *        $ref: '#/components/responses/code500'
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
 *                 example: Locker1
 *               latitude:
 *                 type: number
 *                 example: 41° 53' 24″ E 12° 29' 32
 *               longitude:
 *                 type: number
 *                 example: 41° 53' 24″ E 12° 29' 32
 *               width:
 *                 type: number
 *                 example: 60
 *               height:
 *                 type: number
 *                 example: 60
 *               depth:
 *                 type: number
 *                 example: 60
 *
 */
router.post('/', async (req, res, next) => {
    try {
        if (checkIfEmpty(req.body, res)) return;

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
        let id = locker._id;

        res.json({
            id,
            name,
            latitude,
            longitude,
            width,
            height,
            depth
        });
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
 *          $ref: '#/components/responses/code200'
 *       '400':
 *          $ref: '#/components/responses/code400'
 *       '500':
 *          $ref: '#/components/responses/code500'
 *     tags:
 *     - Lockers
 *     summary: Search all lockers.
 *     parameters:
 *         - in: query
 *           name: name
 *           schema:
 *             type: string
 *           required: false
 *           description: Name of the locker the user is looking for
 */
router.get('/', async (req, res, next) => {
    // TODO: check if logged user is an admin
    const regex = new RegExp(req.query.name, 'i')
    let lockers = await Locker.find(
        {name: {$regex: regex}}
    )

    res.json(mapLockersToDto(req, lockers, true));
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
router.get('/available', async (req, res, next) => {
    const regex = new RegExp(req.query.name, 'i')
    //console.log(req);
    let lockers = await Locker.find(
        {name: {$regex: regex}, userId: {$ne: req.loggedUser.id}}
    )

    res.json(mapLockersToDto(req, lockers, true));
});

/**
 * @openapi
 * /api/v1/lockers/booked:
 *   get:
 *     responses:
 *       '200':
 *         description: List of booked lockers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id of the locker in the database
 *                   example: 6290daa478b876fa28581b97
 *                 name:
 *                   type: string
 *                   description: Name of the locker inserted on registration
 *                   example: Locker1
 *                 latitude:
 *                   type: number
 *                   description: Latitude of the locker (for further api integration)
 *                   example: 41° 53' 24″ E 12° 29' 32″
 *                 longitude:
 *                   type: number
 *                   description: Longitude of the locker (for further api integration)
 *                   example: 41° 53' 24″ E 12° 29' 32″
 *                 width:
 *                   type: number
 *                   description: Width of the locker (centimeters)
 *                   example: 60
 *                 height:
 *                   type: number
 *                   description: Height of the locker (centimeters)
 *                   example: 60
 *                 depth:
 *                   type: number
 *                   description: Depth of the locker (centimeters)
 *                   example: 60
 *                 bookedAt:
 *                   type: string
 *                   description: Paragraph used to show when the locker has been booked
 *                   example: Prenotato il 2022-06-06 alle ore 17:54
 *       '400':
 *           $ref: '#/components/responses/code400'
 *       '500':
 *           $ref: '#/components/responses/code500'
 *     tags:
 *     - Lockers
 *     summary: Get all locker booked by logged user.
 */
router.get('/booked', async (req, res, next) => {
    const user = req.loggedUser.id;

    let lockers = await Locker.find(
        {userId: {$eq: user}}
    );

    let locker = mapLockersToDto(req, lockers);
    res.json(locker);
});

/**
 * @openapi
 * /api/v1/lockers/{lockerId}:
 *   get:
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/code200'
 *       '400':
 *         $ref: '#/components/responses/code400'
 *       '500':
 *         $ref: '#/components/responses/code500'
 *     tags:
 *     - Lockers
 *     summary: Search a locker by its id
 */
router.get('/:lockerId', async (req, res, next) => {
    const id = req.params.lockerId;
    console.log(id);
    let lockers = await Locker.find(
        {_id: id}
    )

    res.json(mapLockersToDto(req, lockers, true));
});


/**
 * @openapi
 * /api/v1/lockers:
 *   put:
 *    responses:
 *      '200':
 *         $ref: '#/components/responses/code200'
 *      '400':
 *         $ref: '#/components/responses/code400'
 *      '500':
 *         $ref: '#/components/responses/code500'
 *    tags:
 *    - Lockers
 *    summary: Modify a locker
 *    requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Locker1
 *               latitude:
 *                 type: number
 *                 example: 41° 53' 24″ E 12° 29' 32
 *               longitude:
 *                 type: number
 *                 example: 41° 53' 24″ E 12° 29' 32
 *               width:
 *                 type: number
 *                 example: 60
 *               height:
 *                 type: number
 *                 example: 60
 *               depth:
 *                 type: number
 *                 example: 60
 *
 */
router.put('/', async (req, res, next) => {
    if (checkIfEmpty(req.body, res)) {
        return;
    }

    const id = req.params.lockerId;
    if (!req.params.lockerId) {
        handleError(res, 'Missing Locker id');
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
 *         description: Locker deleted
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
router.delete('/:lockerId', async (req, res, next) => {
    if (fieldIsEmpty(req.params.lockerId, 'Missing Locker id', res)) return;

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
 *         description: Locker correctly booked
 *     tags:
 *     - Lockers
 *     summary: Book a locker
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Id of the locker in the database
 *                 example: 6290daa478b876fa28581b97
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

    date = new Date();
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    locker.userId = req.loggedUser.id;
    locker.bookedAt = year + "-" + month + "-" + day + " Alle ore " + hour + ":" + minutes + ":" + seconds;
    locker.save();

    res.sendStatus(200);
});

/**
 * @openapi
 * /api/v1/lockers/cancel:
 *   patch:
 *     responses:
 *       '200':
 *         description: Locker booking correctly cancelled
 *     tags:
 *     - Lockers
 *     summary: Cancel the booking of the locker
 *     requestBody:
 *       require: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Id of the locker in the database
 *                 example: 6290daa478b876fa28581b97
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
        locker.bookedAt = undefined;
        locker.save();

        res.send();

    } catch {
        handleError(res);
    }
});


function mapLockersToDto(req, lockers, addNotAvailable = false) {
    return lockers.map(l => {
            const dto = {
                id: l._id,
                name: l.name,
                latitude: l.latitude,
                longitude: l.longitude,
                width: l.width,
                height: l.height,
                depth: l.depth,
                userId: l.userId,
                bookedAt: l.bookedAt
            }

            if (addNotAvailable) {
                dto.notAvailable = l.userId !== undefined && l.userId !== req.loggedUser.id;
            }

            return dto;
        }
    )
}


module.exports = router;