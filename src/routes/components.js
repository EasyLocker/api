/**
 * @openapi
 * /api/v1/lockers:
 *   post:
 *     responses:
 *      '400':
 *         description: Something's missing in the request
 *         content:
 *           application/json:
 *             schema:
 *               response400:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Missing name.
 */

/**
 * @openapi
 * /api/v1/lockers:
 *   post:
 *     responses:
 *      '500':
 *         description: Something went wrong (e.g. connections or similiar)
 *         content:
 *           application/json:
 *             schema:
 *               response500:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: Unexpected error. We are working to solve the issue. Thanks for your patience
 */

/**
 * @openapi
 * /api/v1/lockers:
 *   post:
 *     responses:
 *      '200':
 *         description: Everything went 'OK'
 *         content:
 *           application/json:
 *             schema:
 *               response200:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Id of the locker in the database
 *                   example: 6290daa478b876fa28581b97
 *                 name:
 *                   type: string
 *                   description: Name of the locker inserted on registration
 *                   example: Mario
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
 */