import { Router } from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';
import { validateAddToCart } from '../middleware/validation';

const router = Router();

router.use(authenticateToken);

router.get('/', CartController.getCart);
router.post('/items', validateAddToCart, CartController.addItem);
router.put('/items/:id', CartController.updateItem);
router.delete('/items/:id', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
