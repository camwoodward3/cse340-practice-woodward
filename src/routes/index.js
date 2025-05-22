import { Router } from 'express';
 
const router = Router();
 
// Home page route
router.get('/', (req, res) => {
    res.render('home', { title: 'Home' });
});
 
// About page route  
router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});
 
export default router;