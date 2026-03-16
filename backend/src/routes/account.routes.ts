import { Router } from 'express'

import { deleteAccount } from '../controllers/account.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const accountRouter = Router()

accountRouter.use(requireAuthenticatedSession)
accountRouter.delete('/account', deleteAccount)

export { accountRouter }
