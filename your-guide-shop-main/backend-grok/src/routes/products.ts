import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

export default router;
