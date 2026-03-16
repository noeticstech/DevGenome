import { Router } from 'express'

import { getStatus } from '../controllers/status.controller'

const statusRouter = Router()

statusRouter.get('/status', getStatus)

export { statusRouter }
