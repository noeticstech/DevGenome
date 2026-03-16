import { Router } from 'express'

import {
  getActivity,
  getDashboard,
  getGenome,
  getSkills,
  getTimeline,
} from '../controllers/product.controller'
import { requireAuthenticatedSession } from '../middleware/require-authenticated-session'

const productRouter = Router()

productRouter.use(requireAuthenticatedSession)
productRouter.get('/dashboard', getDashboard)
productRouter.get('/genome', getGenome)
productRouter.get('/activity', getActivity)
productRouter.get('/skills', getSkills)
productRouter.get('/timeline', getTimeline)

export { productRouter }
