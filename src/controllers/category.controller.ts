import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service.js';

const categoryService = new CategoryService();

export class CategoryController {
    // CREATE
    async createCategory(req: Request, res: Response) {
        try {
            const category = await categoryService.createFromZod(req.body);
            res.status(201).json(category);
        } catch (error: any) {
            // Catches the specific "already exists" error from the service
            if (error.message.includes('already exists')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(400).json({ message: 'Error creating category', error: error.message });
        }
    }

    // READ
    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllFromZod();
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }

            const id = parseInt(idParam, 10);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID format' });
            }

            const category = await categoryService.getByIdFromZod(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching category', error: error.message });
        }
    }

    // UPDATE
    async updateCategory(req: Request, res: Response) {
        try {
            const idParm = req.params.id;

            if (!idParm) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }

            const id = parseInt(idParm, 10);

            if (isNaN(id)) {
                return  res.status(400).json({ message: 'Invalid ID format' });
            }

            const updatedCategory = await categoryService.updateFromZod(id, req.body);
            if (!updatedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json(updatedCategory);
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error updating category', error: error.message });
        }
    }

    // DELETE
    async deleteCategory(req: Request, res: Response) {
        try {
            const idParam = req.params.id;

            if (!idParam) {
                return res.status(400).json({ message: 'ID parameter is required' });
            }

            const id = parseInt(idParam, 10);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Invalid ID format' });
            }

            const success = await categoryService.deleteFromZod(id);
            if (!success) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ message: 'Error deleting category', error: error.message });
        }
    }
}