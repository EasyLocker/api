const express = require('express');
const Locker = require('../db_models/Locker');
const User = require("../db_models/User");
const router = express.Router();

function checks ({ name, latitude, longitude, width, height, depth }, res) {
    if(!name){
        res.status(400);
        res.json({message: 'Missing name'});
        return 0;
    }

    if(!latitude){
        res.status(400);
        res.json({message: 'Missing latitude'});
        return 0;
    }

    if(!longitude){
        res.status(400);
        res.json({message: 'Missing longitude'});
        return 0;
    }

    if(!width){
        res.status(400);
        res.json({message: 'Missing width'});
        return 0;
    }

    if(!height){
        res.status(400);
        res.json({message: 'Missing height'});
        return 0;
    }

    if(!depth){
        res.status(400);
        res.json({message: 'Missing depth'});
        return 0;
    }

    return 1;
}
router.post('/', async (req, res, next) => {
    if(!checks(req.body, res)){
        return;
    }

    const { name,
        latitude,
        longitude,
        width,
        height,
        depth } = req.body;

    //console.log(req.body);
    const locker = new Locker({name, latitude, longitude, width, height, depth});

    locker.save();
    res.send();
});


router.get('/', async(req, res, next) => {
    const regex = new RegExp(req.body.name, 'i')
    let locker = await Locker.find(
        { name: {$regex: regex}}
    )

    res.json(locker);
});

router.put('/', async (req, res, next) => {

    if(!checks(req.body, res)){
        return;
    }

    if(!req.body.id){
        res.status(400);
        res.json({message: 'Missing id'});
        return;
    }

    const { id,
        name,
        latitude,
        longitude,
        width,
        height,
        depth } = req.body;

    let locker = await Locker.replaceOne({ _id: id }, { name, latitude, longitude, width, height, depth });

    if (!locker.modifiedCount){
        res.status(400);
        res.json({message: 'Locker does not exists'});
        return;
    }

    res.json(locker);
});

router.delete('/', async (req, res, next) => {
    if(!req.body.id){
        res.status(400);
        res.json({message: 'Missing id'});
        return;
    }

    let locker = await Locker.findOne({ _id: req.body.id }).exec();

    let del = await Locker.deleteOne(locker);

    if (!del.deletedCount){
        res.status(400);
        res.json({message: 'Locker does not exists'});
        return;
    }

    res.sendStatus(200);
});

//router.patch();
module.exports = router;