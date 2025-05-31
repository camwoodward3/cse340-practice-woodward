import { getNavigationCategories } from "../models/categories/index.js";
// Middleware to add global data to res.locals

export const addGlobalData = (req, res, next) => {
    // Get the current year for copyright notice
    res.locals.currentYear = new Date().getFullYear();

    // Add NODE_ENV for all views
    res.locals.NODE_ENV = process.env.NODE_ENV || 'development';
    next();
}

async function addNavigationData(req, res, next) {
    try{
        const navigationCategories = await getNavigationCategories();
        res.locals.navigationCategories = navigationCategories;
        next();
    } catch (error) {
        console.error('Error loading navigation data:', error.message);
        res.locals.navigationCategories = [];
        next();
    }
}

export { addNavigationData };