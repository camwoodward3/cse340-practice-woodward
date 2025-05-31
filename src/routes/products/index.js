import { Router } from "express";
import {
    getNavigationCategories,
    getCategoryBySlug,
    getChildCategories,
    getProductsByCategory,
    getRandomNavigationCategory
} from '../../models/categories/index.js';

const router = Router();


/**
 * The explore functionality is more complex, involving data fetching and
 * dynamic content, so it gets its own directory. This keeps the code
 * organized and makes it easier to maintain and expand.
 */

// Route for /explore -redirects to a random category
router.get('/', async (req, res, next) => { 
    const randomCategory = await getRandomNavigationCategory();

    if (!randomCategory) {
        const error = new Error('No categories available');
        error.status = 404;
        return next(error);
    }
    res.redirect(`/products/${randomCategory.slug}`);
});

// Route for viewing a category and its items
router.get('/:category', async (req, res, next) => {
    const { category } = req.params;
    const { display = 'grid' } = req.query;

    // Get category from database
    const categoryData = await getCategoryBySlug(category);

    // Check if category exists
    if (!categoryData) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(error);
    }
    // Get subcategories and products for this category
    const subcategories = await getChildCategories(categoryData.id);
    const products = await getProductsByCategory(categoryData.id);
    //Render the explore template with category and items
    res.render('products', { 
        title: `Exploring ${categoryData.name}`,
        display,
        categoryData,
        subcategories,
        products,
        hasProducts: products.length > 0,
        hasSubcategories: subcategories.length > 0
    });
});

export default router;