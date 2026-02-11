import express from 'express';
import { searchProduct, getAutocompleteSuggestions } from '../controllers/productIntel.controller.js';

const router = express.Router();

router.post('/search', searchProduct);
router.get('/suggestions', getAutocompleteSuggestions);

export default router;
