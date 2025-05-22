import { Router } from "express";
import { getAllCategories, getCategory, getCategoryItems, getRandomProduct } from "../../models/explore-data.js";

const router = Router();

/**
 * The explore functionality is more complex, involving data fetching and
 * dynamic content, so it gets its own directory. This keeps the code
 * organized and makes it easier to maintain and expand.
 */

// Route for /explore -redirects to a random category
router.get('/', async (req, res) => {
    const randomProduct = await getRandomProduct();
    res.redirect(`/explore/${randomProduct.category}`);
});

// Route for viewing a category and its items
router.get('/:category', async (req, res) => {
    const { category, display } = req.params;

    // Use model to get category data
    const categoryData = await getCategory(category);

    if (!categoryData) {
        const err = new Error('Category Not Found');
        err.status = 404;
        throw err;
    }

    //Render the explore template with category and items
    const items = await getCategoryItems(category);

    //Render the explore template with category and items
    res.render('products', { 
        title: `${categoryData.name}`,
        display,
        categoryId: category,
        categoryName: categoryData.name,
        categoryDescription: categoryData.description,
        items: items
    });
});

router.get('/:category/:id', async (req, res) => {
    const { category } = req.params;
    res.redirect(`/explore/${category}`);
});

export default router;